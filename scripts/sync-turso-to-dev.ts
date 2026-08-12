import { createClient } from "@libsql/client";
import dotenv from "dotenv";
import { execSync } from "child_process";
import path from "path";

dotenv.config();

const tursoUrl = process.env.TURSO_DATABASE_URL;
const tursoAuthToken = process.env.TURSO_AUTH_TOKEN;

if (!tursoUrl || !tursoAuthToken) {
  console.error("❌ Error: TURSO_DATABASE_URL or TURSO_AUTH_TOKEN is missing in .env");
  process.exit(1);
}

const turso = createClient({
  url: tursoUrl,
  authToken: tursoAuthToken,
});

const devDbPath = path.resolve(process.cwd(), "prisma/dev.db");
const localDb = createClient({
  url: `file:${devDbPath}`,
});

async function getTableColumns(client: typeof turso | typeof localDb, tableName: string): Promise<string[]> {
  const res = await client.execute(`PRAGMA table_info("${tableName}");`);
  return res.rows.map((r) => r.name as string);
}

async function sync() {
  console.log("🔄 Starting Database Sync from Turso (Production) -> Local SQLite (Development)...");

  // Step 1: Ensure local schema is up-to-date using Prisma
  console.log("\n📐 Step 1: Pushing Prisma schema to local database...");
  try {
    execSync("npx prisma db push --skip-generate", { stdio: "inherit" });
    console.log("✓ Local database schema synchronized with schema.prisma");
  } catch (err) {
    console.error("❌ Failed to push Prisma schema:", err);
    process.exit(1);
  }

  // Step 2: Get tables to sync
  const tablesRes = await turso.execute(
    "SELECT name FROM sqlite_master WHERE type = 'table' AND name NOT LIKE 'sqlite_%' AND name NOT LIKE '_prisma_%'"
  );
  const tables = tablesRes.rows.map((r) => r.name as string);

  // Preferred order to respect Foreign Key constraints
  const preferredOrder = ["Product", "Customer", "Transaction", "TransactionItem", "ProductArrival"];
  const sortedTables = preferredOrder.filter((t) => tables.includes(t));
  for (const t of tables) {
    if (!sortedTables.includes(t)) {
      sortedTables.push(t);
    }
  }

  console.log(`\n📋 Tables to sync: ${sortedTables.join(", ")}`);

  // Disable FK constraints during cleanup and sync
  await localDb.execute("PRAGMA foreign_keys = OFF;");

  // Step 3: Clear existing data in local database
  console.log("\n🧹 Step 2: Clearing existing data in local database...");
  for (const table of sortedTables.slice().reverse()) {
    await localDb.execute(`DELETE FROM "${table}";`);
  }
  await localDb.execute("DELETE FROM sqlite_sequence;").catch(() => {});

  // Step 4: Copy data table by table
  console.log("\n📦 Step 3: Copying records from Turso to Local DB...");
  const summary: Record<string, number> = {};

  for (const table of sortedTables) {
    const tursoCols = await getTableColumns(turso, table);
    const localCols = await getTableColumns(localDb, table);

    // Intersect columns to handle schema variations gracefully
    const commonCols = tursoCols.filter((col) => localCols.includes(col));

    if (commonCols.length === 0) {
      console.warn(`  ⚠️ Warning: No matching columns for table "${table}", skipping.`);
      continue;
    }

    const selectColsStr = commonCols.map((c) => `"${c}"`).join(", ");
    const dataRes = await turso.execute(`SELECT ${selectColsStr} FROM "${table}"`);
    const rows = dataRes.rows;
    summary[table] = rows.length;

    if (rows.length === 0) {
      console.log(`  - Table "${table}": 0 rows`);
      continue;
    }

    const colNames = selectColsStr;
    const placeholders = commonCols.map(() => "?").join(", ");
    const insertSql = `INSERT INTO "${table}" (${colNames}) VALUES (${placeholders})`;

    // Insert rows in batches
    const BATCH_SIZE = 50;
    for (let i = 0; i < rows.length; i += BATCH_SIZE) {
      const chunk = rows.slice(i, i + BATCH_SIZE);
      const stmts = chunk.map((row) => {
        const args = commonCols.map((col) => row[col]);
        return {
          sql: insertSql,
          args: args as any,
        };
      });
      await localDb.batch(stmts, "write");
    }

    // Update sqlite_sequence for autoincrement primary keys
    if (commonCols.includes("id")) {
      const maxIdRes = await localDb.execute(`SELECT MAX(id) as max_id FROM "${table}"`);
      const maxId = maxIdRes.rows[0]?.max_id;
      if (maxId !== null && maxId !== undefined && typeof maxId === "number") {
        await localDb
          .execute({
            sql: "INSERT OR REPLACE INTO sqlite_sequence (name, seq) VALUES (?, ?)",
            args: [table, maxId],
          })
          .catch(() => {});
      }
    }

    console.log(`  - Table "${table}": ${rows.length} rows synced ✓`);
  }

  // Re-enable FK constraints
  await localDb.execute("PRAGMA foreign_keys = ON;");

  console.log("\n✅ Database sync completed successfully!");
  console.log("\nSummary of synced data:");
  console.table(summary);
}

sync().catch((err) => {
  console.error("❌ Sync failed:", err);
  process.exit(1);
});
