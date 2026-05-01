import { getPrismaClient } from "../../utils/prisma";

const prisma = getPrismaClient();

export default defineEventHandler(async (event) => {
  const rawId = getRouterParam(event, "id");
  const id = parseInt(rawId as string, 10);

  if (isNaN(id)) {
    throw createError({
      statusCode: 400,
      statusMessage: "ID Transaksi nggak valid",
    });
  }

  if (getMethod(event) === "DELETE") {
    try {
      const transaction = await prisma.transaction.delete({
        where: { id },
        include: { transactionItems: true },
      });

      for (const item of transaction.transactionItems) {
        await prisma.product.update({
          where: { id: item.productId },
          data: { stock: { increment: item.quantity } },
        });
      }

      return { success: true, message: "Transaksi berhasil diapus" };
    } catch (error: any) {
      console.error("Delete transaction error:", error);
      throw createError({
        statusCode: 500,
        statusMessage: error.message || "Yah, gagal apus transaksi",
      });
    }
  }

  if (getMethod(event) === "GET") {
    try {
      const transaction = await prisma.transaction.findUnique({
        where: { id },
        include: {
          customer: true,
          transactionItems: {
            include: {
              product: true,
            },
          },
        },
      });

      if (!transaction) {
        throw createError({
          statusCode: 404,
          statusMessage: "Transaksi nggak ketemu",
        });
      }

      // Compute totals and enrich items
      let totalCost = 0;
      let itemCount = 0;

      const items = transaction.transactionItems.map((it: any) => {
        const buyPrice = it.product?.buyPrice ?? 0;
        const profitPerItem = it.profitPerItem ?? it.soldPrice - buyPrice;
        const totalProfit = profitPerItem * it.quantity;
        totalCost += buyPrice * it.quantity;
        itemCount += it.quantity;
        return {
          id: it.id,
          productId: it.productId,
          product: it.product,
          quantity: it.quantity,
          soldPrice: it.soldPrice,
          subtotal: it.soldPrice * it.quantity,
          buyPrice,
          profitPerItem,
          totalProfit,
        };
      });

      const totalProfit =
        transaction.totalProfit ??
        items.reduce((s: number, i: any) => s + i.totalProfit, 0);
      const totalAmount =
        transaction.totalAmount ??
        items.reduce((s: number, i: any) => s + i.subtotal, 0);

      return {
        id: transaction.id,
        invoiceNumber: null,
        createdAt: transaction.createdAt,
        customer: transaction.customer,
        status: "completed",
        totalAmount,
        totalProfit,
        totalCost,
        itemCount,
        transactionItems: items,
      };
    } catch (error: any) {
      console.error("Get transaction error:", error);
      throw createError({
        statusCode: 500,
        statusMessage: error.message || "Gagal ambil transaksi",
      });
    }
  }

  throw createError({
    statusCode: 405,
    statusMessage: "Method Not Allowed",
  });
});
