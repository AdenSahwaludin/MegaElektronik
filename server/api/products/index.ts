import { getPrismaClient } from "../../utils/prisma";

const prisma = getPrismaClient();

export default defineEventHandler(async (event) => {
  // POST: Add single product or bulk import
  if (getMethod(event) === "POST") {
    try {
      const body = await readBody(event);

      // Check if it's bulk import (with products array) or single product
      const isBulkImport = body.products && Array.isArray(body.products);

      let createdProducts = [];

      if (isBulkImport) {
        // Bulk import mode
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
      } else {
        // Single product mode
        if (
          !body.name ||
          body.stock === undefined ||
          body.buyPrice === undefined ||
          body.askingPrice === undefined
        ) {
          throw createError({
            statusCode: 400,
            statusMessage:
              "Missing required fields: name, stock, buyPrice, askingPrice",
          });
        }

        const product = await prisma.product.create({
          data: {
            name: body.name.trim(),
            brand: body.brand?.trim() || "Unbranded",
            model: body.model?.trim() || "Standard",
            stock: parseInt(body.stock, 10),
            buyPrice: parseInt(body.buyPrice, 10),
            askingPrice: parseInt(body.askingPrice, 10),
            fixedPrice: body.fixedPrice
              ? parseInt(body.fixedPrice, 10)
              : parseInt(body.askingPrice, 10),
          },
        });

        return {
          success: true,
          product,
          message: "Product added successfully",
        };
      }
    } catch (error: any) {
      console.error("Product error:", error);
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
