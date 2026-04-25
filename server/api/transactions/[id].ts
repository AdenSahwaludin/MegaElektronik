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

  throw createError({
    statusCode: 404,
    statusMessage: "Enggak ketemu",
  });
});
