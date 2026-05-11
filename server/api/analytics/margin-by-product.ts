import { getPrismaClient } from "../../utils/prisma";
import { getDateFilter } from "../../utils/analytics";

const prisma = getPrismaClient();

export default defineEventHandler(async (event) => {
  const query = getQuery(event);
  const dateRange = (query.dateRange as string) || "month";
  const startDate = query.startDate as string;
  const endDate = query.endDate as string;
  const limit = parseInt(query.limit as string) || 15;
  const { filter: where } = getDateFilter(dateRange, startDate, endDate);

  const items = await prisma.transactionItem.findMany({
    where: {
      transaction: where
    },
    select: {
      productId: true,
      quantity: true,
      profitPerItem: true,
      product: { select: { name: true } }
    }
  });

  const productStats: Record<number, { name: string, totalProfit: number, soldCount: number }> = {};

  items.forEach(item => {
    if (!productStats[item.productId]) {
      productStats[item.productId] = { name: item.product.name, totalProfit: 0, soldCount: 0 };
    }
    productStats[item.productId].totalProfit += (item.profitPerItem * item.quantity);
    productStats[item.productId].soldCount += item.quantity;
  });

  const result = Object.values(productStats)
    .map(p => ({
      name: p.name,
      profit: p.totalProfit,
      soldCount: p.soldCount
    }))
    .sort((a, b) => b.profit - a.profit)
    .slice(0, limit);

  return {
    labels: result.map(r => r.name),
    data: result.map(r => r.profit),
    soldCounts: result.map(r => r.soldCount)
  };
});
