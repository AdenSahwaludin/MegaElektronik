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
            const created = await (prisma.product as any).create({
              data: {
                barcode: product.barcode ? String(product.barcode).trim() : null,
                name: product.name.trim(),
                brand: product.brand.trim(),
                model: product.model.trim(),
                otherName: product.otherName ? product.otherName.trim() : null,
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

        const product = await (prisma.product as any).create({
          data: {
            barcode: body.barcode ? String(body.barcode).trim() : null,
            name: body.name.trim(),
            brand: body.brand?.trim() || " ",
            model: body.model?.trim() || " ",
            otherName: body.otherName?.trim() || null,
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
      const limit = Math.min(parseInt(query.limit as string) || 10, 10000);
      const offset = (page - 1) * limit;

      const activeOnly = query.activeOnly === "true";
      const lowStockOnly = query.lowStockOnly === "true";
      const unbarcodedOnly = query.unbarcodedOnly === "true";

      // Build WHERE clause
      let where: any = {};
      let andConditions: any[] = [];

      if (activeOnly) {
        andConditions.push({ isActive: true });
      }

      if (lowStockOnly) {
        andConditions.push({ stock: 0 });
      }

      if (unbarcodedOnly) {
        andConditions.push({
          OR: [
            { barcode: null },
            { barcode: "" }
          ]
        });
      }

      // Advanced search: split by spaces and match ALL keywords
      if (search.trim()) {
        const keywords = search
          .trim()
          .toLowerCase()
          .split(/\s+/)
          .filter((k) => k.length > 0);

        if (keywords.length > 0) {
          // Every keyword must match name, brand, model, otherName, or barcode
          const searchConditions = keywords.map((keyword) => {
            const isShortNumeric = keyword.length <= 2 && /^\d+$/.test(keyword);
            const fields: any[] = [
              { name: { contains: keyword } },
              { brand: { contains: keyword } },
              { otherName: { contains: keyword } },
              { barcode: { contains: keyword } },
            ];
            if (!isShortNumeric) {
              fields.push({ model: { contains: keyword } });
            }
            return { OR: fields };
          });

          andConditions.push(...searchConditions);
        }
      }

      if (andConditions.length > 0) {
        where.AND = andConditions;
      }

      const validSortFields = ["name", "brand", "model", "stock", "askingPrice", "fixedPrice", "buyPrice", "servicePrice", "isActive", "barcode", "createdAt"];
      const sortBy = validSortFields.includes(query.sortBy as string) ? (query.sortBy as string) : "name";
      const sortOrder = (query.sortOrder as string) || "asc";

      // Fetch total count and paginated results in parallel
      const [total, products] = await Promise.all([
        prisma.product.count({ where }),
        (prisma.product as any).findMany({
          where,
          orderBy: { [sortBy]: sortOrder },
          select: {
            id: true,
            barcode: true,
            name: true,
            brand: true,
            model: true,
            otherName: true,
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
        }),
      ]);

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
