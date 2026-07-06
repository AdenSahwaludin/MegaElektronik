import { getPrismaClient } from "../../utils/prisma";
import { getDateFilter } from "../../utils/analytics";

const prisma = getPrismaClient();

// WIB = UTC+7
const WIB_OFFSET_HOURS = 7;

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

  // Init distributions — semua 24 jam
  for (let i = 0; i <= 23; i++) hourDistribution[i] = 0;
  for (let i = 0; i <= 6; i++) dayDistribution[i] = 0;

  transactions.forEach(t => {
    // Buat Date object dari createdAt
    const date = new Date(t.createdAt);
    
    // Konversi dari UTC ke WIB (UTC+7)
    // getUTCHours() selalu return UTC hour, lalu kita tambahkan offset WIB
    const utcHours = date.getUTCHours();
    const wibHours = (utcHours + WIB_OFFSET_HOURS) % 24;
    
    // Untuk hari, jika penambahan offset melewati midnight, hari juga berubah
    const utcDay = date.getUTCDay(); // 0 = Sunday
    const wibDay = (utcHours + WIB_OFFSET_HOURS >= 24) ? (utcDay + 1) % 7 : utcDay;

    hourDistribution[wibHours]!++;
    dayDistribution[wibDay]!++;
  });

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
