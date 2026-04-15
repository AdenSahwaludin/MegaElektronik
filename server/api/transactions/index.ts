import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default defineEventHandler(async (event) => {
  // GET all transactions with details
  try {
    const transactions = await prisma.transaction.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        customer: {
          select: {
            id: true,
            name: true,
            phone: true,
          },
        },
        transactionItems: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                brand: true,
                model: true,
                buyPrice: true,
              },
            },
          },
        },
      },
    });

    return {
      transactions,
      total: transactions.length,
    };
  } catch (error: any) {
    console.error("Fetch transactions error:", error);
    throw createError({
      statusCode: 500,
      statusMessage: "Failed to fetch transactions",
    });
  }
});
