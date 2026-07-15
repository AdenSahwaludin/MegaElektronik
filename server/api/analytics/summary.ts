import { getPrismaClient } from "../../utils/prisma";
import { getDateFilter } from "../../utils/analytics";

const prisma = getPrismaClient();

export default defineEventHandler(async (event) => {
  const query = getQuery(event);
  const dateRange = (query.dateRange as string) || "month";
  const startDate = query.startDate as string;
  const endDate = query.endDate as string;

  const { filter: where, days } = getDateFilter(dateRange, startDate, endDate);

  const [aggregateData, transactionCount] = await Promise.all([
    prisma.transaction.aggregate({
      where,
      _sum: {
        totalAmount: true,
        totalProfit: true,
      }
    }),
    prisma.transaction.count({ where })
  ]);

  // Fetch all items to calculate real total profit per product (more accurate)
  const allItems = await prisma.transactionItem.findMany({
    where: {
      transaction: where
    },
    select: {
      productId: true,
      quantity: true,
      profitPerItem: true,
      product: { select: { name: true, brand: true, model: true } }
    }
  });

  const productStats: Record<number, { name: string, qty: number, profit: number }> = {};
  allItems.forEach(item => {
    if (!productStats[item.productId]) {
      const productName = item.product ? `${item.product.name} ${item.product.brand} ${item.product.model}`.trim() : 'Produk Terhapus';
      productStats[item.productId] = { name: productName, qty: 0, profit: 0 };
    }
    productStats[item.productId]!.qty += item.quantity;
    productStats[item.productId]!.profit += (item.profitPerItem * item.quantity);
  });

  const statsArray = Object.values(productStats);
  const bestSeller = statsArray.length > 0
    ? statsArray.sort((a, b) => b.qty - a.qty)[0]
    : null;

  const mostProfitable = statsArray.length > 0
    ? statsArray.sort((a, b) => b.profit - a.profit)[0]
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
