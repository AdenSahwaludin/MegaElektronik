import { getPrismaClient } from "../../utils/prisma";
import { getDateFilter } from "../../utils/analytics";

const prisma = getPrismaClient();

// Helper to get YYYY-MM-DD in local time
const toLocalDateString = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export default defineEventHandler(async (event) => {
  const query = getQuery(event);
  const dateRange = (query.dateRange as string) || "month";
  const startDate = query.startDate as string;
  const endDate = query.endDate as string;
  
  const { filter: where } = getDateFilter(dateRange, startDate, endDate);
  
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  
  let start = new Date(today);
  let end = new Date(today);

  if (where.createdAt) {
    if (where.createdAt.gte) {
      start = new Date(where.createdAt.gte);
      start.setHours(0, 0, 0, 0);
    }
    
    if (where.createdAt.lt) {
      const ltDate = new Date(where.createdAt.lt);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      end = ltDate > tomorrow ? new Date(today) : new Date(ltDate.getTime() - 1000);
    } else if (where.createdAt.lte) {
      const lteDate = new Date(where.createdAt.lte);
      end = lteDate > today ? new Date(today) : lteDate;
    }
  }

  end.setHours(23, 59, 59, 999);

  // Generate date series using local time
  const dates: string[] = [];
  const curr = new Date(start);
  while (curr <= end) {
    dates.push(toLocalDateString(curr));
    curr.setDate(curr.getDate() + 1);
  }

  const transactions = await prisma.transaction.findMany({
    where: {
      createdAt: {
        gte: start,
        lte: end
      }
    },
    select: {
      createdAt: true,
      totalAmount: true,
      totalProfit: true
    }
  });

  const trend: Record<string, { revenue: number, profit: number }> = {};
  dates.forEach(date => {
    trend[date] = { revenue: 0, profit: 0 };
  });

  transactions.forEach(t => {
    // Group using local time
    const date = toLocalDateString(new Date(t.createdAt));
    if (trend[date]) {
      trend[date].revenue += t.totalAmount;
      trend[date].profit += t.totalProfit;
    }
  });

  const revenueData = dates.map(d => trend[d].revenue);
  const profitData = dates.map(d => trend[d].profit);

  return {
    labels: dates,
    datasets: [
      { label: 'Omset', data: revenueData },
      { label: 'Profit', data: profitData }
    ]
  };
});
