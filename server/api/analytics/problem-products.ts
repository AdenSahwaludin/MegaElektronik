import { Prisma } from "@prisma/client";
import { getPrismaClient } from "../../utils/prisma";

const prisma = getPrismaClient();

export default defineEventHandler(async (event) => {
  // Perf: sebelumnya load SEMUA produk aktif + SEMUA transactionItems +
  // transaction (nested include) ke memori. Sekarang agregasi di DB.
  // NOTE: revenue/profit dihitung tertimbang qty (qty*soldPrice),
  // sebelumnya hanya sum per-baris tanpa qty sehingga margin salah untuk qty > 1.
  const [lowStockProducts, salesStats, neverSoldProducts] = await Promise.all([
    prisma.product.findMany({
      where: { isActive: true, stock: { lt: 5 } },
      select: { id: true, name: true, brand: true, model: true, stock: true },
      orderBy: { stock: "asc" },
      take: 500,
    }),
    prisma.$queryRaw<Array<{
      productId: number;
      revenue: number | bigint;
      profit: number | bigint;
      sold: number | bigint;
      lastSold: string | Date | null;
    }>>(Prisma.sql`
      SELECT ti."productId" AS productId,
             SUM(ti."quantity" * ti."soldPrice") AS revenue,
             SUM(ti."quantity" * ti."profitPerItem") AS profit,
             SUM(ti."quantity") AS sold,
             MAX(t."createdAt") AS lastSold
      FROM "TransactionItem" ti
      JOIN "Transaction" t ON t."id" = ti."transactionId"
      GROUP BY ti."productId"
    `),
    prisma.product.findMany({
      where: { isActive: true, transactionItems: { none: {} } },
      select: { id: true, name: true, brand: true, model: true, stock: true },
      orderBy: { stock: "asc" },
      take: 200,
    }),
  ]);

  const now = Date.now();
  const byId = new Map<number, {
    id: number;
    name: string;
    brand: string | null;
    model: string | null;
    stock: number;
    avgMargin: number;
    soldCount: number;
    lastSold: Date | null;
    daysSinceLastSold: number;
  }>();

  for (const p of lowStockProducts) {
    byId.set(p.id, {
      id: p.id,
      name: p.name,
      brand: p.brand,
      model: p.model,
      stock: p.stock,
      avgMargin: 0,
      soldCount: 0,
      lastSold: null,
      daysSinceLastSold: 999,
    });
  }
  for (const p of neverSoldProducts) {
    if (!byId.has(p.id)) {
      byId.set(p.id, {
        id: p.id,
        name: p.name,
        brand: p.brand,
        model: p.model,
        stock: p.stock,
        avgMargin: 0,
        soldCount: 0,
        lastSold: null,
        daysSinceLastSold: 999,
      });
    }
  }

  const statIds = salesStats.map((s) => s.productId);
  const statProducts = statIds.length > 0
    ? await prisma.product.findMany({
        where: { id: { in: statIds } },
        select: { id: true, name: true, brand: true, model: true, stock: true },
      })
    : [];
  const productById = new Map(statProducts.map((p) => [p.id, p]));

  for (const s of salesStats) {
    const revenue = Number(s.revenue || 0);
    const profit = Number(s.profit || 0);
    const lastSold = s.lastSold ? new Date(s.lastSold) : null;
    const daysSinceLastSold = lastSold
      ? Math.floor((now - lastSold.getTime()) / (1000 * 60 * 60 * 24))
      : 999;
    const existing = byId.get(s.productId);
    const info = productById.get(s.productId);
    if (existing) {
      existing.avgMargin = revenue > 0 ? (profit / revenue) * 100 : 0;
      existing.soldCount = Number(s.sold || 0);
      existing.lastSold = lastSold;
      existing.daysSinceLastSold = daysSinceLastSold;
    } else if (info) {
      byId.set(s.productId, {
        id: s.productId,
        name: info.name,
        brand: info.brand,
        model: info.model,
        stock: info.stock,
        avgMargin: revenue > 0 ? (profit / revenue) * 100 : 0,
        soldCount: Number(s.sold || 0),
        lastSold,
        daysSinceLastSold,
      });
    }
  }

  const problems = [...byId.values()]
    .filter((p) => p.stock < 5 || p.avgMargin < 10 || p.daysSinceLastSold > 30);

  return problems.sort((a, b) => a.stock - b.stock).slice(0, 500);
});
