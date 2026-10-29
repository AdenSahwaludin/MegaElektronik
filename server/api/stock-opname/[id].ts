import { getPrismaClient } from "../../utils/prisma";

const prisma = getPrismaClient();

export default defineEventHandler(async (event) => {
  const rawId = getRouterParam(event, "id");
  const id = parseInt(rawId as string, 10);
  const method = getMethod(event);

  if (isNaN(id)) {
    throw createError({
      statusCode: 400,
      statusMessage: "ID Stock Opname tidak valid",
    });
  }

  try {
    // GET: Ambil detail 1 catatan Stock Opname
    if (method === "GET") {
      const opname = await prisma.stockOpname.findUnique({
        where: { id },
        include: {
          product: {
            select: {
              id: true,
              name: true,
              brand: true,
              model: true,
              barcode: true,
              stock: true,
              lastStockOpnameAt: true,
            },
          },
        },
      });

      if (!opname) {
        throw createError({
          statusCode: 404,
          statusMessage: "Catatan Stock Opname tidak ditemukan",
        });
      }

      return { success: true, opname };
    }

    // PUT: Update / Edit catatan Stock Opname (CRUD Update)
    if (method === "PUT") {
      const body = await readBody(event);
      const newPhysicalStock = parseInt(String(body.physicalStock), 10);
      const notes = body.notes !== undefined ? (body.notes?.trim() || null) : undefined;

      if (isNaN(newPhysicalStock) || newPhysicalStock < 0) {
        throw createError({
          statusCode: 400,
          statusMessage: "Jumlah stok fisik harus berupa angka non-negatif",
        });
      }

      // Ambil data opname lama beserta produknya
      const existing = await prisma.stockOpname.findUnique({
        where: { id },
        include: { product: true },
      });

      if (!existing) {
        throw createError({
          statusCode: 404,
          statusMessage: "Data Stock Opname tidak ditemukan",
        });
      }

      // Hitung selisih perubahan dari stok fisik lama ke baru
      // Contoh: Sebelumnya opname fisik = 10, sekarang direvisi jadi 12 -> perubahan +2
      const stockChange = newPhysicalStock - existing.physicalStock;
      const newDifference = newPhysicalStock - existing.systemStock;

      // Update produk (sesuaikan stok produk dengan selisih revisi)
      const currentProductStock = existing.product?.stock ?? 0;
      const updatedProductStock = Math.max(0, currentProductStock + stockChange);

      const [updatedOpname, updatedProduct] = await Promise.all([
        prisma.stockOpname.update({
          where: { id },
          data: {
            physicalStock: newPhysicalStock,
            difference: newDifference,
            ...(notes !== undefined ? { notes } : {}),
            updatedAt: new Date(),
          },
          include: {
            product: {
              select: {
                id: true,
                name: true,
                brand: true,
                model: true,
                stock: true,
              },
            },
          },
        }),
        prisma.product.update({
          where: { id: existing.productId },
          data: {
            stock: updatedProductStock,
            lastStockOpnameAt: new Date(),
          },
        }),
      ]);

      return {
        success: true,
        opname: updatedOpname,
        product: updatedProduct,
        message: "Catatan stock opname dan stok produk berhasil diperbarui",
      };
    }

    // DELETE: Hapus catatan Stock Opname dan kembalikan stok (CRUD Delete)
    if (method === "DELETE") {
      const existing = await prisma.stockOpname.findUnique({
        where: { id },
        include: { product: true },
      });

      if (!existing) {
        throw createError({
          statusCode: 404,
          statusMessage: "Data Stock Opname tidak ditemukan",
        });
      }

      // Revert penyesuaian stok produk
      // Saat opname dibuat: stok diubah jadi physicalStock (penambahan/pengurangan = existing.difference)
      // Saat dihapus: stok produk dikembalikan = currentStock - existing.difference
      const currentStock = existing.product?.stock ?? 0;
      const revertedStock = Math.max(0, currentStock - existing.difference);

      // Hapus data riwayat opname
      await prisma.stockOpname.delete({
        where: { id },
      });

      // Cek apakah masih ada riwayat opname lain untuk produk ini
      const latestRemainingOpname = await prisma.stockOpname.findFirst({
        where: { productId: existing.productId },
        orderBy: { createdAt: "desc" },
      });

      const updatedProduct = await prisma.product.update({
        where: { id: existing.productId },
        data: {
          stock: revertedStock,
          lastStockOpnameAt: latestRemainingOpname ? latestRemainingOpname.createdAt : null,
        },
        select: {
          id: true,
          name: true,
          brand: true,
          model: true,
          stock: true,
          lastStockOpnameAt: true,
        },
      });

      return {
        success: true,
        message: "Riwayat stock opname berhasil dihapus dan penyesuaian stok telah dikembalikan.",
        product: updatedProduct,
      };
    }

    throw createError({
      statusCode: 405,
      statusMessage: "Method Not Allowed",
    });
  } catch (error: any) {
    console.error(`API Stock Opname [${id}] Error:`, error);
    if (error?.statusCode && error.statusCode >= 400 && error.statusCode < 500) {
      throw error;
    }
    const errorMsg = error?.message || "Gagal memproses data stock opname";
    throw createError({
      statusCode: 500,
      statusMessage: errorMsg.replace(/\n/g, " ").substring(0, 100),
      message: errorMsg,
    });
  }
});
