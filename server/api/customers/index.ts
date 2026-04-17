import { getPrismaClient } from "../../utils/prisma";

const prisma = getPrismaClient();

export default defineEventHandler(async (event) => {
  if (getMethod(event) === "GET") {
    // Fetch all customers
    try {
      const customers = await prisma.customer.findMany({
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          name: true,
          phone: true,
          address: true,
          createdAt: true,
        },
      });
      return { customers, total: customers.length };
    } catch (error: any) {
      console.error("Fetch customers error:", error);
      throw createError({
        statusCode: 500,
        statusMessage: "Failed to fetch customers",
      });
    }
  }

  if (getMethod(event) === "POST") {
    // Create new customer
    try {
      const body = await readBody(event);

      if (!body.name || body.name.trim() === "") {
        throw createError({
          statusCode: 400,
          statusMessage: "Customer name is required",
        });
      }

      const customer = await prisma.customer.create({
        data: {
          name: body.name.trim(),
          phone: body.phone?.trim() || null,
          address: body.address?.trim() || null,
        },
      });

      return {
        success: true,
        ...customer,
      };
    } catch (error: any) {
      console.error("Create customer error:", error);
      throw error;
    }
  }
});
