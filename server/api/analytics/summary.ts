import { Prisma } from "@prisma/client";
import { getPrismaClient } from "../../utils/prisma";
import { getDateFilter, getProductLabel } from "../../utils/analytics";

const prisma = getPrismaClient();

export default defineEventHandler(async (event) => {
  const query = getQuery(event);
  const dateRange = (query.dateRange as string) || "month";
  const startDate = query.startDate as string;
  const endDate = query.endDate as string;

  const { filter: where, days } = getDateFilter(dateRange, startDate, endDate);
  const createdAtFilter = (where as any)?.createdAt as
    | { gte?: Date; lt?: Date }
    | undefined;
  const gteDate = createdAtFilter?.gte ? new Date(createdAtFilter.gte) : null;
  const ltDate = createdAtFilter?.lt ? new Date(createdAtFilter.lt) : null;

  // Perf: agregasi per-produk di DB (GROUP BY), bukan tarik semua
  // transactionItem + join product ke memori lalu reduce di JS.
  const [aggregateData, transactionCount, grouped] = await Promise.all([
    prisma.transaction.aggregate({
      where,
      _sum: {
        totalAmount: true,
        totalProfit: true,
      }
    }),
    prisma.transaction.count({ where }),
    prisma.$queryRaw<Array<{ productId: number; qty: number | bigint; profit: number | bigint }>>(Prisma.sql`
      SELECT ti."productId" AS productId,
             SUM(ti."quantity") AS qty,
             SUM(ti."quantity" * ti."profitPerItem") AS profit
      FROM "TransactionItem" ti
      JOIN "Transaction" t ON t."id" = ti."transactionId"
      WHERE 1 = 1
        ${gteDate ? Prisma.sql`AND t."createdAt" >= ${gteDate}` : Prisma.empty}
        ${ltDate ? Prisma.sql`AND t."createdAt" < ${ltDate}` : Prisma.empty}
      GROUP BY ti."productId"
    `)
  ]);

  // Nama produk hanya diambil untuk kandidat teratas, bukan untuk semua item
  const sortedByQty = [...grouped].sort((a, b) => Number(b.qty) - Number(a.qty));
  const sortedByProfit = [...grouped].sort((a, b) => Number(b.profit) - Number(a.profit));
  const topIds = Array.from(new Set([
    ...sortedByQty.slice(0, 5).map((r) => r.productId),
    ...sortedByProfit.slice(0, 5).map((r) => r.productId),
  ]));
  const products = topIds.length > 0
    ? await prisma.product.findMany({
        where: { id: { in: topIds } },
        select: { id: true, name: true, brand: true, model: true },
      })
    : [];
  const nameById = new Map(products.map((p) => [p.id, getProductLabel(p.name, p.brand, p.model)]));

  const bestRow = sortedByQty[0];
  const profitRow = sortedByProfit[0];
  const bestSeller = bestRow
    ? { name: nameById.get(bestRow.productId) ?? "Produk Terhapus", qty: Number(bestRow.qty), profit: Number(bestRow.profit) }
    : null;
  const mostProfitable = profitRow
    ? { name: nameById.get(profitRow.productId) ?? "Produk Terhapus", qty: Number(profitRow.qty), profit: Number(profitRow.profit) }
    : null;

  const totalAmount = aggregateData._sum.totalAmount || 0;
  const totalProfit = aggregateData._sum.totalProfit || 0;

  // Calculate days in period for average
  let daysInPeriod = days;

  if (dateRange === "all" || daysInPeriod === 0) {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const firstTx = await prisma.transaction.findFirst({ orderBy: { createdAt: 'asc' } });
    if (firstTx) {
      const diffTime = Math.abs(today.getTime() - new Date(firstTx.createdAt).getTime());
      daysInPeriod = Math.max(Math.ceil(diffTime / (1000 * 60 * 60 * 24)), 1);
    } else {
      daysInPeriod = 1;
    }
  }

  const avgProfitPerDay = totalProfit / daysInPeriod;
  const avgTransactionsPerDay = transactionCount / daysInPeriod;
  const aov = transactionCount > 0 ? totalAmount / transactionCount : 0;

  return {
    avgProfitPerDay: avgProfitPerDay,
    avgTransactionsPerDay: avgTransactionsPerDay,
    aov: aov,
    transactionCount,
    bestSeller,
    mostProfitable
  };
});
