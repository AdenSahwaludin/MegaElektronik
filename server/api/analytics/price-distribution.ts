import { getPrismaClient } from "../../utils/prisma";
import { getDateFilter } from "../../utils/analytics";

const prisma = getPrismaClient();

export default defineEventHandler(async (event) => {
  const query = getQuery(event);
  const dateRange = (query.dateRange as string) || "month";
  const startDate = query.startDate as string;
  const endDate = query.endDate as string;
  const { filter: where } = getDateFilter(dateRange, startDate, endDate);

  const items = await prisma.transactionItem.findMany({
    where: {
      transaction: where
    },
    include: {
      product: true
    }
  });

  const distribution = {
    'Harga Tawar': 0,
    'Harga Pas': 0,
    'Harga Service': 0,
    'Harga Nego Bebas': 0
  };

  items.forEach(item => {
    if (item.soldPrice === item.product.askingPrice) {
      distribution['Harga Tawar']++;
    } else if (item.soldPrice === item.product.fixedPrice) {
      distribution['Harga Pas']++;
    } else if (item.product.servicePrice && item.soldPrice === item.product.servicePrice) {
      distribution['Harga Service']++;
    } else {
      distribution['Harga Nego Bebas']++;
    }
  });

  return {
    labels: Object.keys(distribution),
    data: Object.values(distribution)
  };
});
