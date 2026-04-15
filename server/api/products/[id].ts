import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, "id");

  // PUT: Update product
  if (getMethod(event) === "PUT") {
    try {
      const body = await readBody(event);

      const product = await prisma.product.update({
        where: { id },
        data: {
          name: body.name,
          brand: body.brand,
          model: body.model,
          stock: body.stock,
          buyPrice: body.buyPrice,
          askingPrice: body.askingPrice,
        },
      });

      return { success: true, product };
    } catch (error: any) {
      console.error("Update product error:", error);
      throw createError({
        statusCode: 500,
        statusMessage: "Failed to update product",
      });
    }
  }

  // DELETE: Delete product
  if (getMethod(event) === "DELETE") {
    try {
      await prisma.product.delete({
        where: { id },
      });

      return { success: true, message: "Product deleted" };
    } catch (error: any) {
      console.error("Delete product error:", error);
      throw createError({
        statusCode: 500,
        statusMessage: "Failed to delete product",
      });
    }
  }
});
