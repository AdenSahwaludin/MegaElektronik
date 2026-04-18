import { createClient } from "@libsql/client";

const client = createClient({
  url: "libsql://mega-elektronik-adensahwaludin.aws-ap-northeast-1.turso.io",
  authToken:
    "eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJpYXQiOjE3NzY0Mjc1ODMsImlkIjoiMDE5ZDliNTUtNTMwMS03NzNlLTk0OGEtOTU4Nzc5MWY2YjI4IiwicmlkIjoiYjEyN2ZlZmMtNTUzNS00MWUyLWJkYjItYmQ2NzE1MmJjZmNmIn0.IUgDbVLlgUcv6E6U_2DyLWzuJ6zf2j7YsR-LBFAfdzgtQaWcpZezqqESSY7iJ8k6qj3aQ2lq9jEXoUExiwXSDw",
});

const migrations = [
  // Add isActive column with default value true
  `ALTER TABLE "Product" ADD COLUMN "isActive" BOOLEAN NOT NULL DEFAULT true;`,

  // Create index for isActive
  `CREATE INDEX "Product_isActive_idx" ON "Product"("isActive");`,
];

try {
  for (const migration of migrations) {
    console.log(`Executing: ${migration.substring(0, 50)}...`);
    await client.execute(migration);
  }
  console.log("✓ Migration completed successfully!");
} catch (error: any) {
  // Handle case where column already exists
  if (
    error.message?.includes("duplicate column name") ||
    error.message?.includes("already exists")
  ) {
    console.log("✓ Column isActive already exists, skipping migration");
    process.exit(0);
  }
  console.error("✗ Migration error:", error);
  process.exit(1);
}
