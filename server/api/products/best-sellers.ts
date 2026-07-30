import { getPrismaClient } from "../../utils/prisma";

const prisma = getPrismaClient();

/**
 * GET /api/products/best-sellers
 * Returns a map of productId -> totalQuantitySold (all time)
 */
export default defineEventHandler(async (_event) => {
  const soldData = await prisma.transactionItem.groupBy({
    by: ["productId"],
    _sum: {
      quantity: true,
    },
  });

  // Convert to a simple { [productId]: totalSold } map
  const result: Record<number, number> = {};
  for (const row of soldData) {
    result[row.productId] = row._sum.quantity ?? 0;
  }

  return result;
});
