import { getPrismaClient } from "../../utils/prisma";
import { getDateFilter } from "../../utils/analytics";

const prisma = getPrismaClient();

export default defineEventHandler(async (event) => {
  const query = getQuery(event);
  const dateRange = (query.dateRange as string) || "month";
  const startDate = query.startDate as string;
  const endDate = query.endDate as string;
  const { filter: where } = getDateFilter(dateRange, startDate, endDate);

  const transactions = await prisma.transaction.findMany({
    where,
    select: {
      createdAt: true
    }
  });

  const hourDistribution: Record<number, number> = {};
  const dayDistribution: Record<number, number> = {};

  // Init distributions
  for (let i = 8; i <= 20; i++) hourDistribution[i] = 0;
  for (let i = 0; i <= 6; i++) dayDistribution[i] = 0;

  transactions.forEach(t => {
    const date = new Date(t.createdAt);
    const hour = date.getHours();
    const day = date.getDay(); // 0 = Sunday

    if (hour >= 8 && hour <= 20) {
      hourDistribution[hour]!++;
    }
    dayDistribution[day]!++;
  });

  const dayLabels = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];

  return {
    hours: {
      labels: Object.keys(hourDistribution).map(h => `${h}:00`),
      data: Object.values(hourDistribution)
    },
    days: {
      labels: dayLabels,
      data: Object.values(dayDistribution)
    }
  };
});
