import { getPrismaClient } from "../../utils/prisma";

const prisma = getPrismaClient();

export default defineEventHandler(async (event) => {
  const method = getMethod(event);

  try {
    // POST: Simpan Stock Opname (single atau multi-item)
    if (method === "POST") {
      const body = await readBody(event);
      let items: Array<{ productId: number | string; physicalStock: number | string; notes?: string }> = [];

      if (body.items && Array.isArray(body.items)) {
        items = body.items;
      } else if (body.productId !== undefined && body.physicalStock !== undefined) {
        items = [{
          productId: body.productId,
          physicalStock: body.physicalStock,
          notes: body.notes,
        }];
      } else {
        throw createError({
          statusCode: 400,
          statusMessage: "Data stock opname tidak valid (harus menyertakan produk dan stok fisik)",
        });
      }

      if (items.length === 0) {
        throw createError({
          statusCode: 400,
          statusMessage: "Daftar item stock opname tidak boleh kosong",
        });
      }

      const results = [];
      const updatedProducts = [];

      for (const item of items) {
        const productId = parseInt(String(item.productId), 10);
        const physicalStock = parseInt(String(item.physicalStock), 10);
        const notes = item.notes?.trim() || null;

        if (isNaN(productId) || isNaN(physicalStock) || physicalStock < 0) {
          throw createError({
            statusCode: 400,
            statusMessage: `Produk ID #${item.productId} atau jumlah fisik (${item.physicalStock}) tidak valid`,
          });
        }

        // Ambil stok sistem saat ini
        const product = await prisma.product.findUnique({
          where: { id: productId },
          select: {
            id: true,
            name: true,
            brand: true,
            model: true,
            stock: true,
          },
        });

        if (!product) {
          throw createError({
            statusCode: 404,
            statusMessage: `Produk dengan ID #${productId} tidak ditemukan`,
          });
        }

        const systemStock = product.stock;
        const difference = physicalStock - systemStock;
        const now = new Date();

        // 1. Simpan catatan Stock Opname di riwayat
        const opname = await prisma.stockOpname.create({
          data: {
            productId,
            systemStock,
            physicalStock,
            difference,
            notes,
            createdAt: now,
            updatedAt: now,
          },
          include: {
            product: {
              select: {
                id: true,
                name: true,
                brand: true,
                model: true,
              },
            },
          },
        });

        // 2. Perbarui stok aktual di tabel Product dan tandai lastStockOpnameAt
        const updatedProduct = await prisma.product.update({
          where: { id: productId },
          data: {
            stock: physicalStock,
            lastStockOpnameAt: now,
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

        results.push(opname);
        updatedProducts.push(updatedProduct);
      }

      return {
        success: true,
        count: results.length,
        results,
        updatedProducts,
        message: `Berhasil menyimpan stock opname untuk ${results.length} produk dan memperbarui stok fisik.`,
      };
    }

    // GET: Ambil daftar riwayat Stock Opname (dengan pagination & search)
    if (method === "GET") {
      const query = getQuery(event);
      const page = Math.max(parseInt(query.page as string, 10) || 1, 1);
      const limit = Math.min(Math.max(parseInt(query.limit as string, 10) || 20, 1), 100);
      const offset = (page - 1) * limit;

      const search = ((query.search as string) || "").trim();
      const productId = query.productId ? parseInt(query.productId as string, 10) : undefined;
      const differenceType = query.differenceType as string; // 'all' | 'mismatch' | 'match' | 'positive' | 'negative'

      const andConditions: any[] = [];

      if (productId && !isNaN(productId)) {
        andConditions.push({ productId });
      }

      if (differenceType === "mismatch") {
        andConditions.push({ difference: { not: 0 } });
      } else if (differenceType === "match") {
        andConditions.push({ difference: 0 });
      } else if (differenceType === "positive") {
        andConditions.push({ difference: { gt: 0 } });
      } else if (differenceType === "negative") {
        andConditions.push({ difference: { lt: 0 } });
      }

      if (search) {
        andConditions.push({
          OR: [
            { notes: { contains: search } },
            {
              product: {
                OR: [
                  { name: { contains: search } },
                  { brand: { contains: search } },
                  { model: { contains: search } },
                  { otherName: { contains: search } },
                ],
              },
            },
          ],
        });
      }

      const where: any = andConditions.length > 0 ? { AND: andConditions } : {};

      const [total, stockOpnames] = await Promise.all([
        prisma.stockOpname.count({ where }),
        prisma.stockOpname.findMany({
          where,
          orderBy: { createdAt: "desc" },
          take: limit,
          skip: offset,
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
        }),
      ]);

      return {
        success: true,
        stockOpnames,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      };
    }

    throw createError({
      statusCode: 405,
      statusMessage: "Method Not Allowed",
    });
  } catch (error: any) {
    console.error("API Stock Opname Handler error:", error);
    if (error?.statusCode && error.statusCode >= 400 && error.statusCode < 500) {
      throw error;
    }
    const errorMsg = error?.message || "Terjadi kesalahan pada server saat memproses stock opname";
    throw createError({
      statusCode: 500,
      statusMessage: errorMsg.replace(/\n/g, " ").substring(0, 100),
      message: errorMsg,
    });
  }
});
