import { Prisma } from "@prisma/client";
import { getPrismaClient } from "../../utils/prisma";
import { getDateFilter, getProductLabel } from "../../utils/analytics";

const prisma = getPrismaClient();

export default defineEventHandler(async (event) => {
  const query = getQuery(event);
  const dateRange = (query.dateRange as string) || "month";
  const startDate = query.startDate as string;
  const endDate = query.endDate as string;
  const limit = Math.min(Math.max(parseInt(query.limit as string) || 15, 1), 50);
  const { filter: where } = getDateFilter(dateRange, startDate, endDate);
  const createdAtFilter = (where as any)?.createdAt as
    | { gte?: Date; lt?: Date }
    | undefined;
  const gteDate = createdAtFilter?.gte ? new Date(createdAtFilter.gte) : null;
  const ltDate = createdAtFilter?.lt ? new Date(createdAtFilter.lt) : null;

  // Perf: agregasi di DB, bukan tarik semua item + join product ke memori.
  const grouped = await prisma.$queryRaw<Array<{ productId: number; profit: number | bigint; sold: number | bigint }>>(Prisma.sql`
    SELECT ti."productId" AS productId,
           SUM(ti."quantity" * ti."profitPerItem") AS profit,
           SUM(ti."quantity") AS sold
    FROM "TransactionItem" ti
    JOIN "Transaction" t ON t."id" = ti."transactionId"
    WHERE 1 = 1
      ${gteDate ? Prisma.sql`AND t."createdAt" >= ${gteDate}` : Prisma.empty}
      ${ltDate ? Prisma.sql`AND t."createdAt" < ${ltDate}` : Prisma.empty}
    GROUP BY ti."productId"
    ORDER BY profit DESC
    LIMIT ${limit}
  `);

  const products = grouped.length > 0
    ? await prisma.product.findMany({
        where: { id: { in: grouped.map((r) => r.productId) } },
        select: { id: true, name: true, brand: true, model: true },
      })
    : [];
  const nameById = new Map(products.map((p) => [p.id, getProductLabel(p.name, p.brand, p.model)]));

  const result = grouped.map((r) => ({
    name: nameById.get(r.productId) ?? "Unknown Product",
    profit: Number(r.profit),
    soldCount: Number(r.sold),
  }));

  return {
    labels: result.map(r => r.name),
    data: result.map(r => r.profit),
    soldCounts: result.map(r => r.soldCount)
  };
});
