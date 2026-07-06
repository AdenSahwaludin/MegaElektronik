import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function fixTable(tableName: any) {
  console.log(`Fixing ${tableName}...`);
  // Get rows where createdAt is text
  const rows = await prisma.$queryRawUnsafe<any[]>(`SELECT id, createdAt FROM "${tableName}" WHERE typeof(createdAt) = 'text'`);
  let count = 0;
  for (const row of rows) {
    // Prisma returns row.createdAt as a string or Date object
    const date = new Date(row.createdAt);
    if (!isNaN(date.getTime())) {
      const ms = date.getTime();
      await prisma.$executeRawUnsafe(`UPDATE "${tableName}" SET createdAt = ${ms} WHERE id = ${row.id}`);
      count++;
    }
  }
  console.log(`Fixed ${count} rows in ${tableName}.`);
}

async function fixUpdatedAt(tableName: any) {
  console.log(`Fixing updatedAt in ${tableName}...`);
  const rows = await prisma.$queryRawUnsafe<any[]>(`SELECT id, updatedAt FROM "${tableName}" WHERE typeof(updatedAt) = 'text'`);
  let count = 0;
  for (const row of rows) {
    const date = new Date(row.updatedAt);
    if (!isNaN(date.getTime())) {
      const ms = date.getTime();
      await prisma.$executeRawUnsafe(`UPDATE "${tableName}" SET updatedAt = ${ms} WHERE id = ${row.id}`);
      count++;
    }
  }
  console.log(`Fixed ${count} updatedAt rows in ${tableName}.`);
}

async function main() {
  await fixTable('Transaction');
  await fixTable('TransactionItem');
  await fixTable('Product');
  await fixUpdatedAt('Product');
  await fixTable('Customer');
  await fixUpdatedAt('Customer');
  await fixTable('ProductArrival');

  // Cleanup test row
  await prisma.transaction.delete({ where: { id: 220 } }).catch(() => { });
}
main();
