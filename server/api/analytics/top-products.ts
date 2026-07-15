import { getPrismaClient } from "../../utils/prisma";
import { getDateFilter } from "../../utils/analytics";

const prisma = getPrismaClient();

export default defineEventHandler(async (event) => {
  const query = getQuery(event);
  const dateRange = (query.dateRange as string) || "month";
  const startDate = query.startDate as string;
  const endDate = query.endDate as string;
  const limit = parseInt(query.limit as string) || 10;
  const { filter: where } = getDateFilter(dateRange, startDate, endDate);

  const topProducts = await prisma.transactionItem.groupBy({
    by: ['productId'],
    where: {
      transaction: where
    },
    _sum: {
      quantity: true,
      soldPrice: true // This is price per item, so we need to multiply in raw or handle differently
    },
    orderBy: {
      _sum: {
        quantity: 'desc'
      }
    },
    take: limit
  });

  // Calculate revenue per product manually because soldPrice in schema is per unit
  const items = await prisma.transactionItem.findMany({
    where: {
      transaction: where
    },
    select: {
      productId: true,
      quantity: true,
      soldPrice: true,
      product: { select: { name: true, brand: true, model: true } }
    }
  });

  const productStats: Record<number, { name: string, quantity: number, revenue: number }> = {};

  items.forEach(item => {
    if (!productStats[item.productId]) {
      const productName = item.product ? `${item.product.name} ${item.product.brand} ${item.product.model}`.trim() : 'Unknown Product';
      productStats[item.productId] = { name: productName, quantity: 0, revenue: 0 };
    }
    productStats[item.productId]!.quantity += item.quantity;
    productStats[item.productId]!.revenue += item.quantity * item.soldPrice;
  });

  const sortedByQty = Object.values(productStats)
    .sort((a, b) => b.quantity - a.quantity)
    .slice(0, limit);

  const sortedByRevenue = Object.values(productStats)
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, limit);

  return {
    byQuantity: {
      labels: sortedByQty.map(p => p.name),
      data: sortedByQty.map(p => p.quantity)
    },
    byRevenue: {
      labels: sortedByRevenue.map(p => p.name),
      data: sortedByRevenue.map(p => p.revenue)
    }
  };
});
