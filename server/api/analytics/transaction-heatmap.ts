import { Prisma } from "@prisma/client";
import { getPrismaClient } from "../../utils/prisma";
import { getDateFilter } from "../../utils/analytics";

const prisma = getPrismaClient();

export default defineEventHandler(async (event) => {
  const query = getQuery(event);
  const dateRange = (query.dateRange as string) || "month";
  const startDate = query.startDate as string;
  const endDate = query.endDate as string;
  const { filter: where } = getDateFilter(dateRange, startDate, endDate);
  const createdAtFilter = (where as any)?.createdAt as
    | { gte?: Date; lt?: Date }
    | undefined;
  const gteDate = createdAtFilter?.gte ? new Date(createdAtFilter.gte) : null;
  const ltDate = createdAtFilter?.lt ? new Date(createdAtFilter.lt) : null;

  // Perf: agregasi jam/hari di DB, bukan tarik semua createdAt ke memori.
  const grouped = await prisma.$queryRaw<Array<{ h: string; d: string; c: number | bigint }>>(Prisma.sql`
    SELECT
      strftime('%H', datetime(t."createdAt", '+7 hours')) AS h,
      strftime('%w', datetime(t."createdAt", '+7 hours')) AS d,
      COUNT(*) AS c
    FROM "Transaction" t
    WHERE 1 = 1
      ${gteDate ? Prisma.sql`AND t."createdAt" >= ${gteDate}` : Prisma.empty}
      ${ltDate ? Prisma.sql`AND t."createdAt" < ${ltDate}` : Prisma.empty}
    GROUP BY h, d
  `);

  const hourDistribution: Record<number, number> = {};
  const dayDistribution: Record<number, number> = {};

  // Init distributions — semua 24 jam
  for (let i = 0; i <= 23; i++) hourDistribution[i] = 0;
  for (let i = 0; i <= 6; i++) dayDistribution[i] = 0;

  for (const row of grouped) {
    const h = parseInt(row.h, 10);
    const d = parseInt(row.d, 10);
    const c = Number(row.c);
    if (Number.isFinite(h)) hourDistribution[h] = (hourDistribution[h] || 0) + c;
    if (Number.isFinite(d)) dayDistribution[d] = (dayDistribution[d] || 0) + c;
  }

  // Filter jam yang ada transaksinya, atau tampilkan jam operasional 7-21
  const filteredHours: Record<number, number> = {};
  for (let i = 7; i <= 21; i++) {
    filteredHours[i] = hourDistribution[i] || 0;
  }
  // Tambahkan jam di luar 7-21 yang ada transaksinya
  for (let i = 0; i <= 23; i++) {
    if ((i < 7 || i > 21) && hourDistribution[i]! > 0) {
      filteredHours[i] = hourDistribution[i]!;
    }
  }

  // Sort by hour
  const sortedHours = Object.entries(filteredHours)
    .sort(([a], [b]) => Number(a) - Number(b));

  const dayLabels = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];

  return {
    hours: {
      labels: sortedHours.map(([h]) => `${h}:00`),
      data: sortedHours.map(([, v]) => v)
    },
    days: {
      labels: dayLabels,
      data: Object.values(dayDistribution)
    }
  };
});
