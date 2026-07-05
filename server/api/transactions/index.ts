import { getPrismaClient } from "../../utils/prisma";

const prisma = getPrismaClient();

export default defineEventHandler(async (event) => {
  // GET all transactions with server-side filtering and pagination
  try {
    const query = getQuery(event);
    const page = parseInt(query.page as string) || 1;
    const limit = Math.min(parseInt(query.limit as string) || 10, 100);
    const dateRange = (query.dateRange as string) || "all";
    const startDate = (query.startDate as string) || "";
    const endDate = (query.endDate as string) || "";
    const search = (query.search as string) || "";

    // Calculate date boundaries for quick filters
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() - today.getDay());
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 7);

    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 1);

    // Build WHERE clause
    let dateFilter: any = {};

    if (startDate || endDate) {
      const start = startDate ? new Date(startDate) : new Date(0);
      const end = endDate ? new Date(endDate) : new Date();
      end.setHours(23, 59, 59, 999);
      
      dateFilter = {
        createdAt: {
          gte: start,
          lte: end,
        },
      };
    } else {
      if (dateRange === "today") {
        dateFilter = { createdAt: { gte: today, lt: tomorrow } };
      } else if (dateRange === "week") {
        dateFilter = { createdAt: { gte: weekStart, lt: weekEnd } };
      } else if (dateRange === "month") {
        dateFilter = { createdAt: { gte: monthStart, lt: monthEnd } };
      } else if (dateRange === "last_month") {
        const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 1);
        dateFilter = { createdAt: { gte: lastMonthStart, lt: lastMonthEnd } };
      }
    }

    // Build search filter
    let searchFilter: any = {};
    if (search) {
      searchFilter = {
        transactionItems: {
          some: {
            product: {
              OR: [
                { name: { contains: search } },
                { brand: { contains: search } },
                { model: { contains: search } },
              ],
            },
          },
        },
      };
    }

    const where = {
      ...dateFilter,
      ...searchFilter,
    };

    // Get total count
    const totalCount = await prisma.transaction.count({ where });
    const totalPages = Math.ceil(totalCount / limit);

    // Fetch paginated transactions
    const transactions = await prisma.transaction.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
      include: {
        customer: {
          select: {
            id: true,
            name: true,
            phone: true,
            address: true,
          },
        },
        transactionItems: {
          select: {
            id: true,
            quantity: true,
            soldPrice: true,
            profitPerItem: true,
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

    // Calculate summary from filtered data
    const aggregateData = await prisma.transaction.aggregate({
      where,
      _sum: {
        totalAmount: true,
        totalProfit: true,
      },
      _count: true,
    });

    // Calculate total cost and items sold from ALL filtered transactions (not just current page)
    const allFilteredTransactions = await prisma.transaction.findMany({
      where,
      include: {
        transactionItems: {
          include: {
            product: {
              select: {
                buyPrice: true,
              },
            },
          },
        },
      },
    });

    let totalCost = 0;
    let totalItemsSold = 0;
    const dailyProfits: Record<string, number> = {};
    const dailyRevenues: Record<string, number> = {};

    for (const transaction of allFilteredTransactions) {
      // Calculate daily profit and revenue using the same formatting as the frontend
      const dateKey = new Date(transaction.createdAt).toLocaleDateString("id-ID", {
        day: "2-digit",
        month: "long",
        year: "numeric",
      });
      dailyProfits[dateKey] = (dailyProfits[dateKey] || 0) + (transaction.totalProfit || 0);
      dailyRevenues[dateKey] = (dailyRevenues[dateKey] || 0) + (transaction.totalAmount || 0);

      for (const item of transaction.transactionItems) {
        totalCost += item.product.buyPrice * item.quantity;
        totalItemsSold += item.quantity;
      }
    }

    return {
      transactions,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages,
      },
      summary: {
        totalRevenue: aggregateData._sum.totalAmount || 0,
        totalProfit: aggregateData._sum.totalProfit || 0,
        totalCost,
        totalItemsSold,
        transactionCount: aggregateData._count,
      },
      dailyProfits,
      dailyRevenues,
    };
  } catch (error: any) {
    console.error("Fetch transactions error:", error);
    throw createError({
      statusCode: 500,
      statusMessage: "Gagal ngambil data transaksi",
    });
  }
});
