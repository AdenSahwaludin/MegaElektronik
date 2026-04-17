import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default defineEventHandler(async (event) => {
  // 1. Ambil parameter mentah dari URL (berupa String)
  const rawId = getRouterParam(event, "id");

  // 2. Ubah menjadi Angka (Integer)
  const id = parseInt(rawId as string, 10);

  // 3. Validasi: pastikan ID benar-benar angka yang valid
  if (isNaN(id)) {
    throw createError({
      statusCode: 400,
      statusMessage: "Invalid Transaction ID",
    });
  }

  // DELETE: Delete transaction and related items
  if (getMethod(event) === "DELETE") {
    try {
      // Delete will cascade to TransactionItem due to schema config
      const transaction = await prisma.transaction.delete({
        where: { id },
        include: {
          transactionItems: true,
        },
      });

      // Restore product stock
      for (const item of transaction.transactionItems) {
        await prisma.product.update({
          where: { id: item.productId },
          data: {
            stock: {
              increment: item.quantity,
            },
          },
        });
      }

      return { success: true, message: "Transaction deleted successfully" };
    } catch (error: any) {
      console.error("Delete transaction error:", error);
      throw createError({
        statusCode: 500,
        statusMessage: error.message || "Failed to delete transaction",
      });
    }
  }

  throw createError({
    statusCode: 404,
    statusMessage: "Not found",
  });
});
