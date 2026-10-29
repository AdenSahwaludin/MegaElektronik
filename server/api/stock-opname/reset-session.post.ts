import { getPrismaClient } from "../../utils/prisma";

const prisma = getPrismaClient();

export default defineEventHandler(async (event) => {
  try {
    // Reset status lastStockOpnameAt di semua produk
    const result = await prisma.product.updateMany({
      data: {
        lastStockOpnameAt: null,
      },
    });

    return {
      success: true,
      count: result.count,
      message: `Berhasil memulai siklus baru. Sebanyak ${result.count} produk ditandai belum di-opname (riwayat audit lama tetap tersimpan).`,
    };
  } catch (error: any) {
    console.error("Reset Stock Opname Session Error:", error);
    const errorMsg = error?.message || "Gagal mereset siklus stock opname";
    throw createError({
      statusCode: 500,
      statusMessage: errorMsg.replace(/\n/g, " ").substring(0, 100),
      message: errorMsg,
    });
  }
});
