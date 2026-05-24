import { PrismaClient } from "@prisma/client";
import { readFileSync } from "fs";
import path from "path";

const prisma = new PrismaClient();

async function main() {
  console.log("Starting seed...");

  // 1. Clean up existing data (optional, but good for clean seed)
  if (process.env.DATABASE_URL?.includes("turso") || process.env.NODE_ENV === "production") {
    console.error("DANGER: Seeder tried to run against production! Aborting.");
    return;
  }

  await prisma.transactionItem.deleteMany({});
  await prisma.transaction.deleteMany({});
  await prisma.product.deleteMany({});
  await prisma.customer.deleteMany({});

  console.log("Cleaned up existing data.");

  const parseDate = (d: any) => {
    if (!d) return new Date();
    if (typeof d === "string" && /^\d+$/.test(d)) return new Date(parseInt(d));
    return new Date(d);
  };

  // 2. Read JSONs
  const productJsonPath = path.join(process.cwd(), "docs", "Product (1).json");
  const transactionJsonPath = path.join(process.cwd(), "docs", "Transaction (1).json");
  const transactionItemJsonPath = path.join(process.cwd(), "docs", "TransactionItem (1).json");

  const rawProducts = JSON.parse(readFileSync(productJsonPath, "utf-8"));
  const products = rawProducts.map((p: any) => ({
    id: p.id,
    name: p.name,
    brand: p.brand || "",
    model: p.model || "",
    buyPrice: p.buyPrice || 0,
    askingPrice: p.askingPrice || 0,
    fixedPrice: p.fixedPrice || 0,
    stock: p.stock || 0,
    servicePrice: p.servicePrice,
    isActive: p.isActive === "1" || p.isActive === true || p.isActive === 1,
    createdAt: parseDate(p.createdAt),
  }));

  await prisma.product.createMany({ data: products });
  console.log(`Seeded ${products.length} products.`);

  const rawTransactions = JSON.parse(readFileSync(transactionJsonPath, "utf-8"));
  const transactions = rawTransactions.map((t: any) => ({
    id: t.id,
    customerId: t.customerId || null,
    totalAmount: t.totalAmount || 0,
    totalProfit: t.totalProfit || 0,
    createdAt: parseDate(t.createdAt),
  }));

  await prisma.transaction.createMany({ data: transactions });
  console.log(`Seeded ${transactions.length} transactions.`);

  const rawTransactionItems = JSON.parse(readFileSync(transactionItemJsonPath, "utf-8"));
  const transactionItems = rawTransactionItems.map((ti: any) => ({
    id: ti.id,
    transactionId: ti.transactionId,
    productId: ti.productId,
    quantity: ti.quantity || 1,
    soldPrice: ti.soldPrice || 0,
    profitPerItem: ti.profitPerItem || 0,
    createdAt: parseDate(ti.createdAt),
  }));

  await prisma.transactionItem.createMany({ data: transactionItems });
  console.log(`Seeded ${transactionItems.length} transaction items.`);

  console.log("Seed finished!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
