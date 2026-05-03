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
              statusMessage: `Format produk nggak bener: ${JSON.stringify(product)}`,
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
                stock: parseInt(String(product.stock), 10) || 0,
                servicePrice: (product.servicePrice !== undefined && product.servicePrice !== null) ? parseInt(String(product.servicePrice), 10) : null,
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
          message: `Sip, berhasil import ${createdProducts.length} produk`,
        };
      } else {
        // Single product mode
        if (
          !body.name ||
          body.stock === undefined ||
          body.stock === null ||
          body.buyPrice === undefined ||
          body.buyPrice === null ||
          body.askingPrice === undefined ||
          body.askingPrice === null
        ) {
          throw createError({
            statusCode: 400,
            statusMessage:
              "Isi dulu semua yang wajib: nama, stok, harga beli, harga tawar",
          });
        }

        const product = await prisma.product.create({
          data: {
            name: body.name.trim(),
            brand: body.brand?.trim() || "Unbranded",
            model: body.model?.trim() || "Standard",
            stock: parseInt(String(body.stock), 10) || 0,
            servicePrice: (body.servicePrice !== undefined && body.servicePrice !== null && body.servicePrice !== "") ? parseInt(String(body.servicePrice), 10) : null,
            buyPrice: parseInt(String(body.buyPrice), 10) || 0,
            askingPrice: parseInt(String(body.askingPrice), 10) || 0,
            fixedPrice: (body.fixedPrice !== undefined && body.fixedPrice !== null && body.fixedPrice !== "")
              ? parseInt(String(body.fixedPrice), 10)
              : parseInt(String(body.askingPrice), 10),
            isActive: body.isActive !== false, // Default to true
          },
        });

        return {
          success: true,
          product,
          message: "Produk berhasil ditambah",
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

      const activeOnly = query.activeOnly === "true";

      // Build WHERE clause
      let where: any = {};
      let andConditions: any[] = [];

      if (activeOnly) {
        andConditions.push({ isActive: true });
      }

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

          andConditions.push(...searchConditions);
        }
      }

      if (andConditions.length > 0) {
        where.AND = andConditions;
      }

      // Fetch total count
      const total = await prisma.product.count({ where });

      const validSortFields = ["name", "brand", "model", "stock", "askingPrice", "fixedPrice", "buyPrice", "servicePrice", "isActive", "createdAt"];
      const sortBy = validSortFields.includes(query.sortBy as string) ? (query.sortBy as string) : "name";
      const sortOrder = (query.sortOrder as string) || "asc";

      // Fetch paginated results
      const products = await prisma.product.findMany({
        where,
        orderBy: { [sortBy]: sortOrder },
        select: {
          id: true,
          name: true,
          brand: true,
          model: true,
          buyPrice: true,
          askingPrice: true,
          fixedPrice: true,
          stock: true,
          servicePrice: true,
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
    const errorMsg = error?.message || "Yah, ada error di server nih";
    throw createError({
      statusCode: 500,
      statusMessage: errorMsg.replace(/\n/g, ' ').substring(0, 100), // Show error in network tab
      message: errorMsg,
    });
  }
});
