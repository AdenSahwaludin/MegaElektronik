import { getPrismaClient } from "../../utils/prisma";

const prisma = getPrismaClient();

export default defineEventHandler(async (event) => {
  if (getMethod(event) !== "POST") {
    throw createError({
      statusCode: 405,
      statusMessage: "Method Not Allowed",
    });
  }

  try {
    const body = await readBody(event);

    // Validate input
    if (!body.items || !Array.isArray(body.items) || body.items.length === 0) {
      throw createError({
        statusCode: 400,
        statusMessage: "Cart is empty",
      });
    }

    if (body.totalAmount === undefined || body.totalProfit === undefined) {
      throw createError({
        statusCode: 400,
        statusMessage: "Missing totalAmount or totalProfit",
      });
    }

    // Start a transaction
    const transaction = await prisma.$transaction(async (tx: any) => {
      // Perf: 1x bulk fetch produk (sebelumnya N findUnique sequential),
      // update stok paralel, tanpa include product yang berat.
      const productIds = [...new Set(body.items.map((item: any) => item.productId))];
      const products = await tx.product.findMany({
        where: { id: { in: productIds } },
        select: { id: true, name: true, stock: true },
      });
      const productById = new Map(products.map((p: any) => [p.id, p]));

      for (const item of body.items) {
        const product = productById.get(item.productId);

        if (!product) {
          throw new Error(`Product ID ${item.productId} not found`);
        }

        if (product.stock < item.quantity) {
          throw new Error(
            `Stok tidak mencukupi untuk ${product.name}. Tersedia: ${product.stock}, Diminta: ${item.quantity}`,
          );
        }
      }

      // Transaction date
      const createdAt = body.createdAt ? new Date(body.createdAt) : new Date();

      // Create transaction record (tanpa include product yang berat)
      const transactionRecord = await tx.transaction.create({
        data: {
          customerId: body.customerId || null,
          totalAmount: body.totalAmount,
          totalProfit: body.totalProfit,
          paidAmount: body.paidAmount !== undefined ? body.paidAmount : null,
          createdAt: createdAt,
          transactionItems: {
            create: body.items.map((item: any) => ({
              productId: item.productId,
              quantity: item.quantity,
              soldPrice: item.soldPrice,
              profitPerItem: item.soldPrice - item.buyPrice,
              createdAt: createdAt,
            })),
          },
        },
        include: {
          transactionItems: {
            select: { id: true },
          },
        },
      });

      // Update product stock — paralel dalam satu transaksi
      await Promise.all(
        body.items.map((item: any) =>
          tx.product.update({
            where: { id: item.productId },
            data: {
              stock: { decrement: item.quantity },
            },
          }),
        ),
      );

      return transactionRecord;
    });

    return {
      success: true,
      transactionId: transaction.id,
      message: "Checkout completed successfully",
      totalAmount: transaction.totalAmount,
      totalProfit: transaction.totalProfit,
      itemCount: transaction.transactionItems.length,
    };
  } catch (error: any) {
    console.error("Checkout error:", error);
    throw createError({
      statusCode: 500,
      statusMessage: error.message || "Checkout failed",
    });
  }
});
