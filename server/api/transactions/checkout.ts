import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

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
    const transaction = await prisma.$transaction(async (tx) => {
      // Verify stock for all items
      for (const item of body.items) {
        const product = await tx.product.findUnique({
          where: { id: item.productId },
        });

        if (!product) {
          throw new Error(`Product ID ${item.productId} not found`);
        }

        if (product.stock < item.quantity) {
          throw new Error(
            `Insufficient stock for ${product.name}. Available: ${product.stock}, Requested: ${item.quantity}`,
          );
        }
      }

      // Create transaction record
      const transactionRecord = await tx.transaction.create({
        data: {
          customerId: body.customerId || null,
          totalAmount: body.totalAmount,
          totalProfit: body.totalProfit,
          transactionItems: {
            create: body.items.map((item: any) => ({
              productId: item.productId,
              quantity: item.quantity,
              soldPrice: item.soldPrice,
              profitPerItem: item.soldPrice - item.buyPrice,
            })),
          },
        },
        include: {
          transactionItems: {
            include: {
              product: true,
            },
          },
        },
      });

      // Update product stock
      for (const item of body.items) {
        await tx.product.update({
          where: { id: item.productId },
          data: {
            stock: {
              decrement: item.quantity,
            },
          },
        });
      }

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
