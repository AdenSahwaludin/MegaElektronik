import { getPrismaClient } from "../../utils/prisma";

const prisma = getPrismaClient();

export default defineEventHandler(async (event) => {
  const rawId = getRouterParam(event, "id");
  const id = parseInt(rawId as string, 10);

  if (isNaN(id)) {
    throw createError({
      statusCode: 400,
      statusMessage: "ID Produk nggak valid",
    });
  }

  if (getMethod(event) === "PUT") {
    try {
      const body = await readBody(event);
      const name = body.name?.trim();
      const brand = body.brand?.trim() || "Unbranded";
      const model = body.model?.trim() || "Standard";
      const stock = parseInt(body.stock, 10) || 0;
      const buyPrice = parseFloat(body.buyPrice) || 0;
      const askingPrice = parseFloat(body.askingPrice) || 0;
      const fixedPrice = body.fixedPrice ? parseFloat(body.fixedPrice) : askingPrice;
      const isActive = body.isActive !== false;

      if (!name) {
        throw createError({
          statusCode: 400,
          statusMessage: "Nama produk wajib diisi",
        });
      }

      const product = await prisma.product.update({
        where: { id },
        data: { name, brand, model, stock, buyPrice, askingPrice, fixedPrice, isActive },
      });

      return { success: true, product };
    } catch (error: any) {
      console.error("Update product error:", error);
      throw createError({
        statusCode: 500,
        statusMessage: error.message || "Yah, gagal update produk",
      });
    }
  }

  if (getMethod(event) === "DELETE") {
    try {
      await prisma.product.delete({ where: { id } });
      return { success: true, message: "Produk udah diapus" };
    } catch (error: any) {
      console.error("Delete product error:", error);
      throw createError({
        statusCode: 500,
        statusMessage: "Yah, gagal hapus produk",
      });
    }
  }
});
