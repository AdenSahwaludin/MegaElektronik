import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default defineEventHandler(async (event) => {
  // POST: Import products from JSON
  if (getMethod(event) === "POST") {
    try {
      const body = await readBody(event);

      if (!body.products || !Array.isArray(body.products)) {
        throw createError({
          statusCode: 400,
          statusMessage: "Invalid format. Expected { products: [...] }",
        });
      }

      const createdProducts = [];

      for (const product of body.products) {
        // Validate required fields
        if (
          !product.name ||
          !product.brand ||
          !product.model ||
          product.buyPrice === undefined ||
          product.askingPrice === undefined
        ) {
          throw createError({
            statusCode: 400,
            statusMessage: `Invalid product format: ${JSON.stringify(product)}`,
          });
        }

        try {
          const created = await prisma.product.create({
            data: {
              name: product.name.trim(),
              brand: product.brand.trim(),
              model: product.model.trim(),
              buyPrice: parseInt(product.buyPrice, 10),
              askingPrice: parseInt(product.askingPrice, 10),
              fixedPrice: product.fixedPrice
                ? parseInt(product.fixedPrice, 10)
                : parseInt(product.askingPrice, 10),
              stock: product.stock ? parseInt(product.stock, 10) : 0,
            },
          });
          createdProducts.push(created);
        } catch (err: any) {
          // Handle duplicate product name
          if (err.code === "P2002") {
            console.warn(
              `Product "${product.name}" already exists, skipping...`,
            );
          } else {
            throw err;
          }
        }
      }

      return {
        success: true,
        importedCount: createdProducts.length,
        skipped: body.products.length - createdProducts.length,
        message: `Successfully imported ${createdProducts.length} products`,
      };
    } catch (error: any) {
      console.error("Product import error:", error);
      throw error;
    }
  }

  // GET: Fetch all products
  if (getMethod(event) === "GET") {
    try {
      const products = await prisma.product.findMany({
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          name: true,
          brand: true,
          model: true,
          buyPrice: true,
          askingPrice: true,
          fixedPrice: true,
          stock: true,
          createdAt: true,
          updatedAt: true,
        },
      });
      return { products, total: products.length };
    } catch (error: any) {
      console.error("Fetch products error:", error);
      throw createError({
        statusCode: 500,
        statusMessage: "Failed to fetch products",
      });
    }
  }
});
