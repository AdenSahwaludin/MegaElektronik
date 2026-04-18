import { getPrismaClient } from "../../utils/prisma";

const prisma = getPrismaClient();

export default defineEventHandler(async (event) => {
  try {
    // POST: Add single product or bulk import
    if (getMethod(event) === "POST") {
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
                isActive: product.isActive !== false, // Default to true
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
            isActive: body.isActive !== false, // Default to true
          },
        });

        return {
          success: true,
          product,
          message: "Product added successfully",
        };
      }
    }

    // GET: Fetch all products with advanced search and pagination
    if (getMethod(event) === "GET") {
      const query = getQuery(event);
      const search = (query.search as string) || "";
      const page = parseInt(query.page as string) || 1;
      const limit = Math.min(parseInt(query.limit as string) || 10, 100);
      const offset = (page - 1) * limit;

      // Build WHERE clause for advanced search
      let where: any = {};

      // Advanced search: split by spaces and match ALL keywords
      if (search.trim()) {
        const keywords = search
          .trim()
          .toLowerCase()
          .split(/\s+/)
          .filter((k) => k.length > 0);

        if (keywords.length > 0) {
          // Every keyword must match name, brand, or model
          const searchConditions = keywords.map((keyword) => ({
            OR: [
              { name: { contains: keyword } },
              { brand: { contains: keyword } },
              { model: { contains: keyword } },
            ],
          }));

          // Apply AND logic: all conditions must match
          where = {
            AND: searchConditions,
          };
        }
      }

      // Fetch total count
      const total = await prisma.product.count({ where });

      // Fetch paginated results
      const products = await prisma.product.findMany({
        where,
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
          isActive: true,
          createdAt: true,
          updatedAt: true,
        },
        take: limit,
        skip: offset,
      });

      return {
        products,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      };
    }
  } catch (error: any) {
    console.error("API Handler error:", error);
    const errorMsg = error?.message || "Internal server error";
    throw createError({
      statusCode: 500,
      message: errorMsg,
    });
  }
});
