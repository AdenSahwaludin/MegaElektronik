import { createClient } from "@libsql/client";
import dotenv from "dotenv";

dotenv.config();

const tursoUrl = process.env.TURSO_DATABASE_URL;
const tursoAuthToken = process.env.TURSO_AUTH_TOKEN;

if (!tursoUrl || !tursoAuthToken) {
  console.error("TURSO credentials missing in .env");
  process.exit(1);
}

const client = createClient({
  url: tursoUrl,
  authToken: tursoAuthToken,
});

async function main() {
  console.log("Checking and applying migrations to Turso...");

  // 1. Check if lastStockOpnameAt column exists in Product
  const pragma = await client.execute("PRAGMA table_info('Product');");
  const columnNames = pragma.rows.map((r) => r.name as string);

  if (!columnNames.includes("lastStockOpnameAt")) {
    console.log("Adding column lastStockOpnameAt to Product...");
    await client.execute("ALTER TABLE \"Product\" ADD COLUMN \"lastStockOpnameAt\" DATETIME;");
    await client.execute("CREATE INDEX IF NOT EXISTS \"Product_lastStockOpnameAt_idx\" ON \"Product\"(\"lastStockOpnameAt\");");
    console.log("✓ Added lastStockOpnameAt column and index");
  } else {
    console.log("✓ Column lastStockOpnameAt already exists in Product");
  }

  // 2. Create StockOpname table if not exists
  console.log("Creating StockOpname table if not exists...");
  await client.execute(`
    CREATE TABLE IF NOT EXISTS "StockOpname" (
      "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
      "productId" INTEGER NOT NULL,
      "systemStock" INTEGER NOT NULL,
      "physicalStock" INTEGER NOT NULL,
      "difference" INTEGER NOT NULL,
      "notes" TEXT,
      "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT "StockOpname_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product" ("id") ON DELETE CASCADE ON UPDATE CASCADE
    );
  `);

  await client.execute(`
    CREATE INDEX IF NOT EXISTS "StockOpname_productId_idx" ON "StockOpname"("productId");
  `);
  await client.execute(`
    CREATE INDEX IF NOT EXISTS "StockOpname_createdAt_idx" ON "StockOpname"("createdAt");
  `);

  console.log("✓ StockOpname table and indexes created successfully in Turso!");
}

main().catch((err) => {
  console.error("Migration error:", err);
  process.exit(1);
});
