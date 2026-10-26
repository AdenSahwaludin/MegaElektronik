import { getPrismaClient } from "../../utils/prisma";

const prisma = getPrismaClient();

export default defineEventHandler(async (event) => {
  const rawId = getRouterParam(event, "id");
  const id = parseInt(rawId as string, 10);

  if (isNaN(id)) {
    throw createError({
      statusCode: 400,
      statusMessage: "ID Riwayat Barang Datang tidak valid",
    });
  }

  // DELETE: Hapus riwayat kedatangan barang dan kurangi stok kembali
  if (getMethod(event) === "DELETE") {
    try {
      const arrival = await (prisma.productArrival as any).findUnique({
        where: { id },
        include: { product: true },
      });

      if (!arrival) {
        throw createError({
          statusCode: 404,
          statusMessage: "Riwayat kedatangan barang tidak ditemukan",
        });
      }

      // Revert stok produk (kurangi sebesar kuantitas kedatangan barang)
      // Pastikan stok tidak negatif (minimal 0)
      const currentStock = arrival.product?.stock ?? 0;
      const newStock = Math.max(0, currentStock - arrival.quantity);

      await (prisma.product as any).update({
        where: { id: arrival.productId },
        data: { stock: newStock },
      });

      // Hapus data riwayat
      await (prisma.productArrival as any).delete({
        where: { id },
      });

      return {
        success: true,
        message: `Riwayat barang datang berhasil dihapus dan stok produk disesuaikan (-${arrival.quantity})`,
      };
    } catch (error: any) {
      console.error("Delete arrival error:", error);
      throw createError({
        statusCode: error.statusCode || 500,
        statusMessage: error.message || "Gagal menghapus riwayat kedatangan barang",
      });
    }
  }

  throw createError({
    statusCode: 405,
    statusMessage: "Method Not Allowed",
  });
});
