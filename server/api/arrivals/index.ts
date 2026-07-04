import { getPrismaClient } from "../../utils/prisma";

const prisma = getPrismaClient();

export default defineEventHandler(async (event) => {
  try {
    if (getMethod(event) === "POST") {
      const body = await readBody(event);
      
      const { items } = body;
      
      if (!items || !Array.isArray(items) || items.length === 0) {
        throw createError({
          statusCode: 400,
          statusMessage: "Daftar barang masuk tidak boleh kosong.",
        });
      }

      const results = [];

      for (const item of items) {
        const { productId, quantity, supplier, buyPrice, askingPrice, fixedPrice, servicePrice, notes } = item;
        
        if (!productId || !quantity || quantity <= 0) {
          throw createError({
            statusCode: 400,
            statusMessage: "Produk dan jumlah barang (minimal 1) wajib diisi untuk setiap item.",
          });
        }

        // 1. Create the arrival record
        const arrival = await (prisma.productArrival as any).create({
          data: {
            productId: parseInt(productId, 10),
            quantity: parseInt(quantity, 10),
            supplier: supplier?.trim() || null,
            buyPrice: buyPrice ? parseInt(buyPrice, 10) : null,
            askingPrice: askingPrice ? parseInt(askingPrice, 10) : null,
            fixedPrice: fixedPrice ? parseInt(fixedPrice, 10) : null,
            servicePrice: servicePrice ? parseInt(servicePrice, 10) : null,
            notes: notes?.trim() || null,
          }
        });

        // 2. Update the product stock and prices
        const updateData: any = {
          stock: {
            increment: parseInt(quantity, 10)
          }
        };

        if (buyPrice) updateData.buyPrice = parseInt(buyPrice, 10);
        if (askingPrice) updateData.askingPrice = parseInt(askingPrice, 10);
        if (fixedPrice) updateData.fixedPrice = parseInt(fixedPrice, 10);
        if (servicePrice) updateData.servicePrice = parseInt(servicePrice, 10);

        const product = await (prisma.product as any).update({
          where: { id: parseInt(productId, 10) },
          data: updateData
        });

        results.push({ arrival, product });
      }

      return {
        success: true,
        count: results.length,
        message: "Berhasil mencatat kedatangan barang dan stok bertambah",
      };
    }

    if (getMethod(event) === "GET") {
      const query = getQuery(event);
      const limit = Math.min(parseInt(query.limit as string) || 20, 100);
      
      const arrivals = await (prisma.productArrival as any).findMany({
        orderBy: { createdAt: "desc" },
        take: limit,
        include: {
          product: {
            select: {
              name: true,
              brand: true,
              model: true,
            }
          }
        }
      });

      return {
        arrivals,
        limit
      };
    }
  } catch (error: any) {
    console.error("API Handler error (Arrivals):", error);
    const errorMsg = error?.message || "Yah, ada error di server nih";
    throw createError({
      statusCode: 500,
      statusMessage: errorMsg.replace(/\n/g, ' ').substring(0, 100),
      message: errorMsg,
    });
  }
});
