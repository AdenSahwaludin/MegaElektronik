import { getPrismaClient } from "../../utils/prisma";
import { getDateFilter } from "../../utils/analytics";

const prisma = getPrismaClient();

export default defineEventHandler(async (event) => {
  // GET all transactions with server-side filtering and pagination
  try {
    const query = getQuery(event);
    const page = parseInt(query.page as string) || 1;
    const limit = Math.min(parseInt(query.limit as string) || 10, 100);
    const dateRange = (query.dateRange as string) || "all";
    const startDate = (query.startDate as string) || "";
    const endDate = (query.endDate as string) || "";
    const search = (query.search as string) || "";

    // Build WHERE clause using the shared getDateFilter to ensure WIB timezone consistency
    const { filter: dateFilter } = getDateFilter(dateRange, startDate, endDate);
    console.log("DATE FILTER for", dateRange, ":", dateFilter);

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
    const [
      totalCount,
      transactions,
      aggregateData,
      itemsAggregate,
      lightFilteredTransactions,
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

      // 5. Lightweight transaction list for daily profit/revenue breakdown (no relation joins!)
      prisma.transaction.findMany({
        where,
        select: {
          createdAt: true,
          totalAmount: true,
          totalProfit: true,
        },
      }),
    ]);

    const totalPages = Math.ceil(totalCount / limit);
    const totalRevenue = aggregateData._sum.totalAmount || 0;
    const totalProfit = aggregateData._sum.totalProfit || 0;
    // totalCost is mathematically totalRevenue - totalProfit
    const totalCost = totalRevenue - totalProfit;
    const totalItemsSold = itemsAggregate._sum.quantity || 0;

    const dailyProfits: Record<string, number> = {};
    const dailyRevenues: Record<string, number> = {};

    for (const transaction of lightFilteredTransactions) {
      const dateKey = new Date(transaction.createdAt).toLocaleDateString("id-ID", {
        day: "2-digit",
        month: "long",
        year: "numeric",
        timeZone: "Asia/Jakarta",
      });
      dailyProfits[dateKey] = (dailyProfits[dateKey] || 0) + (transaction.totalProfit || 0);
      dailyRevenues[dateKey] = (dailyRevenues[dateKey] || 0) + (transaction.totalAmount || 0);
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
