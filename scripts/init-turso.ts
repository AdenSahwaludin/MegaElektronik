import { createClient } from "@libsql/client";

const client = createClient({
  url: "libsql://mega-elektronik-adensahwaludin.aws-ap-northeast-1.turso.io",
  authToken:
    "eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJpYXQiOjE3NzY0Mjc1ODMsImlkIjoiMDE5ZDliNTUtNTMwMS03NzNlLTk0OGEtOTU4Nzc5MWY2YjI4IiwicmlkIjoiYjEyN2ZlZmMtNTUzNS00MWUyLWJkYjItYmQ2NzE1MmJjZmNmIn0.IUgDbVLlgUcv6E6U_2DyLWzuJ6zf2j7YsR-LBFAfdzgtQaWcpZezqqESSY7iJ8k6qj3aQ2lq9jEXoUExiwXSDw",
});

const sql = `
-- CreateTable
CREATE TABLE "Product" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "brand" TEXT NOT NULL,
    "model" TEXT NOT NULL,
    "buyPrice" INTEGER NOT NULL,
    "askingPrice" INTEGER NOT NULL,
    "fixedPrice" INTEGER NOT NULL,
    "stock" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

CREATE TABLE "Customer" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "phone" TEXT,
    "address" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

CREATE TABLE "Transaction" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "customerId" INTEGER,
    "totalAmount" INTEGER NOT NULL,
    "totalProfit" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Transaction_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "Customer" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

CREATE TABLE "TransactionItem" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "transactionId" INTEGER NOT NULL,
    "productId" INTEGER NOT NULL,
    "quantity" INTEGER NOT NULL,
    "soldPrice" INTEGER NOT NULL,
    "profitPerItem" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "TransactionItem_transactionId_fkey" FOREIGN KEY ("transactionId") REFERENCES "Transaction" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "TransactionItem_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

CREATE INDEX "Product_name_idx" ON "Product"("name");
CREATE INDEX "Product_brand_idx" ON "Product"("brand");
CREATE INDEX "Customer_name_idx" ON "Customer"("name");
CREATE INDEX "Transaction_customerId_idx" ON "Transaction"("customerId");       
CREATE INDEX "Transaction_createdAt_idx" ON "Transaction"("createdAt");
CREATE INDEX "TransactionItem_transactionId_idx" ON "TransactionItem"("transactionId");
CREATE INDEX "TransactionItem_productId_idx" ON "TransactionItem"("productId");
`;

try {
  // Split SQL by semicolon and execute each statement
  const statements = sql
    .split(";")
    .map((s) => s.trim())
    .filter((s) => s.length > 0);

  for (const stmt of statements) {
    console.log(`Executing: ${stmt.substring(0, 50)}...`);
    await client.execute(stmt);
  }

  console.log("✓ All tables created successfully!");
} catch (error) {
  console.error("✗ Error:", error);
  process.exit(1);
}
