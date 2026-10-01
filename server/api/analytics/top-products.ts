import { Prisma } from "@prisma/client";
import { getPrismaClient } from "../../utils/prisma";
import { getDateFilter, getProductLabel } from "../../utils/analytics";

const prisma = getPrismaClient();

export default defineEventHandler(async (event) => {
  const query = getQuery(event);
  const dateRange = (query.dateRange as string) || "month";
  const startDate = query.startDate as string;
  const endDate = query.endDate as string;
  const limit = Math.min(Math.max(parseInt(query.limit as string) || 10, 1), 50);
  const { filter: where } = getDateFilter(dateRange, startDate, endDate);
  const createdAtFilter = (where as any)?.createdAt as
    | { gte?: Date; lt?: Date }
    | undefined;
  const gteDate = createdAtFilter?.gte ? new Date(createdAtFilter.gte) : null;
  const ltDate = createdAtFilter?.lt ? new Date(createdAtFilter.lt) : null;

  // Perf: sebelumnya groupBy + findMany SEMUA item (duplikat kerja, O(N) ke memori).
  // Sekarang 1x agregasi SQL: qty + revenue (= qty*soldPrice) per produk.
  const grouped = await prisma.$queryRaw<Array<{ productId: number; qty: number | bigint; revenue: number | bigint }>>(Prisma.sql`
    SELECT ti."productId" AS productId,
           SUM(ti."quantity") AS qty,
           SUM(ti."quantity" * ti."soldPrice") AS revenue
    FROM "TransactionItem" ti
    JOIN "Transaction" t ON t."id" = ti."transactionId"
    WHERE 1 = 1
      ${gteDate ? Prisma.sql`AND t."createdAt" >= ${gteDate}` : Prisma.empty}
      ${ltDate ? Prisma.sql`AND t."createdAt" < ${ltDate}` : Prisma.empty}
    GROUP BY ti."productId"
  `);

  const sortedByQty = [...grouped].sort((a, b) => Number(b.qty) - Number(a.qty)).slice(0, limit);
  const sortedByRev = [...grouped].sort((a, b) => Number(b.revenue) - Number(a.revenue)).slice(0, limit);
  const needIds = Array.from(new Set([...sortedByQty.map((r) => r.productId), ...sortedByRev.map((r) => r.productId)]));
  const products = needIds.length > 0
    ? await prisma.product.findMany({
        where: { id: { in: needIds } },
        select: { id: true, name: true, brand: true, model: true },
      })
    : [];
  const nameById = new Map(products.map((p) => [p.id, getProductLabel(p.name, p.brand, p.model)]));

  const finalByQty = sortedByQty.map((r) => ({
    name: nameById.get(r.productId) ?? "Unknown Product",
    quantity: Number(r.qty),
  }));
  const sortedByRevenue = sortedByRev.map((r) => ({
    name: nameById.get(r.productId) ?? "Unknown Product",
    revenue: Number(r.revenue),
  }));

  return {
    byQuantity: {
      labels: finalByQty.map(p => p.name),
      data: finalByQty.map(p => p.quantity)
    },
    byRevenue: {
      labels: sortedByRevenue.map(p => p.name),
      data: sortedByRevenue.map(p => p.revenue)
    }
  };
});
