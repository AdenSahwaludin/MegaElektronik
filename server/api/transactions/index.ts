import { Prisma } from "@prisma/client";
import { getPrismaClient } from "../../utils/prisma";
import { getDateFilter } from "../../utils/analytics";

const prisma = getPrismaClient();

export default defineEventHandler(async (event) => {
  // GET all transactions with server-side filtering and pagination
  try {
    const query = getQuery(event);
    const page = Math.max(parseInt(query.page as string) || 1, 1);
    // Perf: cap page size to avoid huge payloads / DB scans
    const limit = Math.min(Math.max(parseInt(query.limit as string) || 10, 1), 100);
    const dateRange = (query.dateRange as string) || "all";
    const startDate = (query.startDate as string) || "";
    const endDate = (query.endDate as string) || "";
    const search = ((query.search as string) || "").trim().slice(0, 100);

    // Build WHERE clause using the shared getDateFilter to ensure WIB timezone consistency
    const { filter: dateFilter } = getDateFilter(dateRange, startDate, endDate);

    // Build search filter
    let searchFilter: any = {};
    if (search) {
      searchFilter = {
        transactionItems: {
          some: {
            product: {
              OR: [
                { name: { contains: search } },
                { brand: { contains: search } },
                { model: { contains: search } },
              ],
            },
          },
        },
      };
    }

    const where = {
      ...dateFilter,
      ...searchFilter,
    };

    // Run queries in parallel via Promise.all for maximum read performance
    // Perf: daily breakdown dihitung via SQL GROUP BY (WIB), bukan fetch
    // semua baris transaksi ke memori (O(N) -> O(#hari)).
    const createdAtFilter = (dateFilter as any)?.createdAt as
      | { gte?: Date; lt?: Date }
      | undefined;
    const gteDate = createdAtFilter?.gte ? new Date(createdAtFilter.gte) : null;
    const ltDate = createdAtFilter?.lt ? new Date(createdAtFilter.lt) : null;
    const likePattern = search ? `%${search}%` : null;

    const dailyRowsPromise = prisma.$queryRaw<
      Array<{ day: string; revenue: number | bigint; profit: number | bigint }>
    >(Prisma.sql`
      SELECT
        date(datetime(t."createdAt", '+7 hours')) AS day,
        SUM(t."totalAmount") AS revenue,
        SUM(t."totalProfit") AS profit
      FROM "Transaction" t
      WHERE 1 = 1
        ${gteDate ? Prisma.sql`AND t."createdAt" >= ${gteDate}` : Prisma.empty}
        ${ltDate ? Prisma.sql`AND t."createdAt" < ${ltDate}` : Prisma.empty}
        ${likePattern
          ? Prisma.sql`AND EXISTS (
              SELECT 1 FROM "TransactionItem" ti
              JOIN "Product" p ON p."id" = ti."productId"
              WHERE ti."transactionId" = t."id"
                AND (p."name" LIKE ${likePattern}
                  OR p."brand" LIKE ${likePattern}
                  OR p."model" LIKE ${likePattern})
            )`
          : Prisma.empty}
      GROUP BY day
    `);

    const [
      totalCount,
      transactions,
      aggregateData,
      itemsAggregate,
      dailyRows,
    ] = await Promise.all([
      // 1. Total count
      prisma.transaction.count({ where }),

      // 2. Paginated transactions for the current page
      prisma.transaction.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
        include: {
          customer: {
            select: {
              id: true,
              name: true,
              phone: true,
              address: true,
            },
          },
          transactionItems: {
            select: {
              id: true,
              quantity: true,
              soldPrice: true,
              profitPerItem: true,
              product: {
                select: {
                  id: true,
                  name: true,
                  brand: true,
                  model: true,
                  buyPrice: true,
                },
              },
            },
          },
        },
      }),

      // 3. Financial summary (Revenue & Profit)
      prisma.transaction.aggregate({
        where,
        _sum: {
          totalAmount: true,
          totalProfit: true,
        },
        _count: true,
      }),

      // 4. Total items sold aggregated on DB level
      prisma.transactionItem.aggregate({
        where: { transaction: where },
        _sum: {
          quantity: true,
        },
      }),

      // 5. Daily revenue/profit breakdown aggregated on DB level (GROUP BY day, WIB)
      dailyRowsPromise,
    ]);

    const totalPages = Math.ceil(totalCount / limit);
    const totalRevenue = aggregateData._sum.totalAmount || 0;
    const totalProfit = aggregateData._sum.totalProfit || 0;
    // totalCost is mathematically totalRevenue - totalProfit
    const totalCost = totalRevenue - totalProfit;
    const totalItemsSold = itemsAggregate._sum.quantity || 0;

    const dailyProfits: Record<string, number> = {};
    const dailyRevenues: Record<string, number> = {};

    for (const row of dailyRows) {
      // Convert YYYY-MM-DD (WIB) ke label "12 Januari 2026" seperti sebelumnya
      const dateKey = new Date(`${row.day}T12:00:00+07:00`).toLocaleDateString("id-ID", {
        day: "2-digit",
        month: "long",
        year: "numeric",
        timeZone: "Asia/Jakarta",
      });
      dailyProfits[dateKey] = Number(row.profit || 0);
      dailyRevenues[dateKey] = Number(row.revenue || 0);
    }

    return {
      transactions,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages,
      },
      summary: {
        totalRevenue,
        totalProfit,
        totalCost,
        totalItemsSold,
        transactionCount: aggregateData._count,
      },
      dailyProfits,
      dailyRevenues,
    };
  } catch (error: any) {
    console.error("Fetch transactions error:", error);
    throw createError({
      statusCode: 500,
      statusMessage: "Gagal ngambil data transaksi",
    });
  }
});
