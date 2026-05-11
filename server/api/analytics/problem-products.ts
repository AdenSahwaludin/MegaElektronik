import { getPrismaClient } from "../../utils/prisma";

const prisma = getPrismaClient();

export default defineEventHandler(async (event) => {
  // Products with low stock or low margin
  const products = await prisma.product.findMany({
    where: {
      isActive: true
    },
    include: {
      transactionItems: {
        include: {
          transaction: true
        }
      }
    }
  });

  const problems = products.map(p => {
    const totalRevenue = p.transactionItems.reduce((sum, item) => sum + item.soldPrice, 0);
    const totalProfit = p.transactionItems.reduce((sum, item) => sum + item.profitPerItem, 0);
    const avgMargin = totalRevenue > 0 ? (totalProfit / totalRevenue) * 100 : 0;
    const soldCount = p.transactionItems.reduce((sum, item) => sum + item.quantity, 0);
    
    // Last sold date
    const sortedTransactions = p.transactionItems
      .map(item => item.transaction.createdAt)
      .sort((a, b) => b.getTime() - a.getTime());
    
    const lastSold = sortedTransactions.length > 0 ? sortedTransactions[0] : null;
    const daysSinceLastSold = lastSold ? Math.floor((new Date().getTime() - lastSold.getTime()) / (1000 * 60 * 60 * 24)) : 999;

    return {
      id: p.id,
      name: p.name,
      stock: p.stock,
      avgMargin,
      soldCount,
      lastSold,
      daysSinceLastSold
    };
  }).filter(p => p.stock < 5 || p.avgMargin < 10 || p.daysSinceLastSold > 30);

  return problems.sort((a, b) => a.stock - b.stock);
});
