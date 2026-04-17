import { getPrismaClient } from "../../utils/prisma";

const prisma = getPrismaClient();

export default defineEventHandler(async (event) => {
  const rawId = getRouterParam(event, "id");
  // Ubah teks menjadi angka
  const id = parseInt(rawId as string, 10);

  // Pengecekan ekstra: pastikan ID benar-benar angka yang valid
  if (isNaN(id)) {
    throw createError({
      statusCode: 400,
      statusMessage: "Invalid Product ID",
    });
  }
  // PUT: Update product
  if (getMethod(event) === "PUT") {
    try {
      const body = await readBody(event);

      // Validate and sanitize input
      const name = body.name?.trim();
      const brand = body.brand?.trim() || "Unbranded";
      const model = body.model?.trim() || "Standard";
      const stock = parseInt(body.stock, 10) || 0;
      const buyPrice = parseFloat(body.buyPrice) || 0;
      const askingPrice = parseFloat(body.askingPrice) || 0;
      const fixedPrice = body.fixedPrice
        ? parseFloat(body.fixedPrice)
        : askingPrice;

      if (!name) {
        throw createError({
          statusCode: 400,
          statusMessage: "Product name is required",
        });
      }

      const product = await prisma.product.update({
        where: { id },
        data: {
          name,
          brand,
          model,
          stock,
          buyPrice,
          askingPrice,
          fixedPrice,
        },
      });

      return { success: true, product };
    } catch (error: any) {
      console.error("Update product error:", error);
      throw createError({
        statusCode: 500,
        statusMessage: error.message || "Failed to update product",
      }); // <-- Tambahan penutup fungsi createError
    } // <-- Tambahan penutup blok catch
  } // <-- Tambahan penutup blok if (PUT)

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
