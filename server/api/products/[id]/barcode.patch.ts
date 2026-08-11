import { getPrismaClient } from "../../../utils/prisma";

const prisma = getPrismaClient();

export default defineEventHandler(async (event) => {
  try {
    const idParam = getRouterParam(event, 'id');
    if (!idParam) {
      throw createError({
        statusCode: 400,
        statusMessage: 'ID produk harus diisi',
      });
    }

    const productId = parseInt(idParam, 10);
    if (isNaN(productId)) {
      throw createError({
        statusCode: 400,
        statusMessage: 'ID produk tidak valid',
      });
    }

    const body = await readBody(event);
    const barcode = body?.barcode ? String(body.barcode).trim() : '';
    const force = Boolean(body?.force);

    if (!barcode) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Barcode tidak boleh kosong',
      });
    }

    const product = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Produk tidak ditemukan',
      });
    }

    // 1. Check Barcode Uniqueness across products
    const existingProduct = await prisma.product.findFirst({
      where: {
        barcode: barcode,
        NOT: { id: productId },
      },
      select: {
        id: true,
        name: true,
      },
    });

    if (existingProduct) {
      throw createError({
        statusCode: 400,
        statusMessage: `Barcode "${barcode}" sudah digunakan oleh produk "${existingProduct.name}"`,
      });
    }

    // 2. Check if product already has a barcode and user hasn't explicitly confirmed overwrite
    if (product.barcode && product.barcode !== barcode && !force) {
      throw createError({
        statusCode: 409,
        statusMessage: `Produk "${product.name}" sudah memiliki barcode (${product.barcode}). Konfirmasi diperlukan untuk menimpa.`,
      });
    }

    // 3. Update Barcode in Database
    const updatedProduct = await prisma.product.update({
      where: { id: productId },
      data: { barcode },
    });

    return {
      success: true,
      product: updatedProduct,
      message: 'Barcode produk berhasil diperbarui',
    };
  } catch (error: any) {
    if (error.statusCode) {
      throw error;
    }
    console.error('Update product barcode error:', error);
    throw createError({
      statusCode: 500,
      statusMessage: error?.message || 'Gagal memperbarui barcode produk',
    });
  }
});
