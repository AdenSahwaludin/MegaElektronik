import { Prisma } from "@prisma/client";
import { getPrismaClient } from "../../utils/prisma";
import { getDateFilter } from "../../utils/analytics";

const prisma = getPrismaClient();

// WIB = UTC+7
const WIB_OFFSET_MS = 7 * 60 * 60 * 1000;

// Helper to get YYYY-MM-DD in WIB timezone
const toWibDateString = (date: Date) => {
  const wibDate = new Date(date.getTime() + WIB_OFFSET_MS);
  const year = wibDate.getUTCFullYear();
  const month = String(wibDate.getUTCMonth() + 1).padStart(2, '0');
  const day = String(wibDate.getUTCDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export default defineEventHandler(async (event) => {
  const query = getQuery(event);
  const dateRange = (query.dateRange as string) || "month";
  const startDate = query.startDate as string;
  const endDate = query.endDate as string;
  
  const { filter: where } = getDateFilter(dateRange, startDate, endDate);
  
  // getDateFilter already returns WIB-adjusted dates
  // We need start/end for generating date series
  let start: Date;
  let end: Date;

  if (where.createdAt) {
    start = where.createdAt.gte ? new Date(where.createdAt.gte) : new Date();
    if (where.createdAt.lt) {
      // lt is midnight of next day in WIB, so end = lt - 1ms
      end = new Date(where.createdAt.lt.getTime() - 1);
    } else if (where.createdAt.lte) {
      end = new Date(where.createdAt.lte);
    } else {
      end = new Date();
    }
  } else {
    // "all" range — fetch first and last transaction
    const firstTx = await prisma.transaction.findFirst({ orderBy: { createdAt: 'asc' }, select: { createdAt: true } });
    const lastTx = await prisma.transaction.findFirst({ orderBy: { createdAt: 'desc' }, select: { createdAt: true } });
    start = firstTx ? new Date(firstTx.createdAt) : new Date();
    end = lastTx ? new Date(lastTx.createdAt) : new Date();
  }

  // Generate date series using WIB dates
  const dates: string[] = [];
  const startDateStr = toWibDateString(start);
  const endDateStr = toWibDateString(end);
  // Walk day-by-day using the start date
  const curr = new Date(start);
  let safety = 0;
  while (toWibDateString(curr) <= endDateStr && safety < 366) {
    dates.push(toWibDateString(curr));
    curr.setDate(curr.getDate() + 1);
    safety++;
  }

  // Perf: agregasi harian di DB (GROUP BY tanggal WIB), bukan tarik
  // semua transaksi ke memori lalu group di JS.
  const grouped = await prisma.$queryRaw<Array<{ day: string; revenue: number | bigint; profit: number | bigint }>>(Prisma.sql`
    SELECT date(datetime(t."createdAt", '+7 hours')) AS day,
           SUM(t."totalAmount") AS revenue,
           SUM(t."totalProfit") AS profit
    FROM "Transaction" t
    WHERE t."createdAt" >= ${start} AND t."createdAt" <= ${end}
    GROUP BY day
  `);

  const trend: Record<string, { revenue: number, profit: number }> = {};
  dates.forEach(date => {
    trend[date] = { revenue: 0, profit: 0 };
  });

  // Samakan zona: day dari SQL sudah dalam tanggal WIB (YYYY-MM-DD)
  grouped.forEach((row) => {
    if (trend[row.day]) {
      trend[row.day]!.revenue += Number(row.revenue || 0);
      trend[row.day]!.profit += Number(row.profit || 0);
    }
  });

  const revenueData = dates.map(d => trend[d]?.revenue ?? 0);
  const profitData = dates.map(d => trend[d]?.profit ?? 0);

  return {
    labels: dates,
    datasets: [
      { label: 'Omset', data: revenueData },
      { label: 'Profit', data: profitData }
    ]
  };
});
