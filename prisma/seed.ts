import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Starting seed...");

  // 1. Clean up existing data (optional, but good for clean seed)
  // We don't want to wipe production, but this script should only be run locally.
  if (process.env.DATABASE_URL?.includes("turso") || process.env.NODE_ENV === "production") {
    console.error("DANGER: Seeder tried to run against production! Aborting.");
    return;
  }

  await prisma.transactionItem.deleteMany({});
  await prisma.transaction.deleteMany({});
  await prisma.product.deleteMany({});
  await prisma.customer.deleteMany({});

  console.log("Cleaned up existing data.");

  // 2. Create Products
  const productsData = [
    { name: "Kipas Angin Berdiri", brand: "Sanex", model: "FS-1899", buyPrice: 120000, askingPrice: 185000, fixedPrice: 175000, servicePrice: 150000, stock: 50 },
    { name: "Kompor Gas 2 Tungku", brand: "Rinnai", model: "RI-522E", buyPrice: 350000, askingPrice: 425000, fixedPrice: 410000, servicePrice: 380000, stock: 30 },
    { name: "Rice Cooker 1.8L", brand: "Cosmos", model: "CRJ-3301", buyPrice: 240000, askingPrice: 310000, fixedPrice: 295000, servicePrice: 270000, stock: 40 },
    { name: "Blender Plastik 2L", brand: "Philips", model: "HR2115", buyPrice: 480000, askingPrice: 650000, fixedPrice: 620000, servicePrice: 580000, stock: 25 },
    { name: "Setrika Listrik", brand: "Maspion", model: "EX-1000", buyPrice: 95000, askingPrice: 135000, fixedPrice: 125000, servicePrice: 115000, stock: 60 },
  ];

  const products = [];
  for (const p of productsData) {
    const created = await prisma.product.create({ data: p });
    products.push(created);
  }
  console.log(`Created ${products.length} products.`);

  // 3. Create a Customer
  const customer = await prisma.customer.create({
    data: {
      name: "Budi Teknisi",
      phone: "08123456789",
      address: "Jl. Merdeka No. 10",
    },
  });

  // 4. Create 20 Transactions over 3 days
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);
  const twoDaysAgo = new Date();
  twoDaysAgo.setDate(today.getDate() - 2);

  const days = [today, yesterday, twoDaysAgo];

  for (let i = 0; i < 20; i++) {
    const randomDay = days[Math.floor(Math.random() * days.length)];
    // Randomize time within that day
    const transactionDate = new Date(randomDay);
    transactionDate.setHours(Math.floor(Math.random() * 12) + 8, Math.floor(Math.random() * 60));

    // Random items (1-3 items per transaction)
    const itemCount = Math.floor(Math.random() * 3) + 1;
    const selectedProducts = [...products].sort(() => 0.5 - Math.random()).slice(0, itemCount);

    let totalAmount = 0;
    let totalProfit = 0;

    const items = selectedProducts.map(p => {
      const isService = Math.random() > 0.7; // 30% chance of being service price
      const price = (isService && p.servicePrice) ? p.servicePrice : p.fixedPrice;
      const quantity = Math.floor(Math.random() * 2) + 1;

      totalAmount += price * quantity;
      totalProfit += (price - p.buyPrice) * quantity;

      return {
        productId: p.id,
        quantity,
        soldPrice: price,
        profitPerItem: price - p.buyPrice,
      };
    });

    await prisma.transaction.create({
      data: {
        customerId: Math.random() > 0.5 ? customer.id : null,
        totalAmount,
        totalProfit,
        createdAt: transactionDate,
        transactionItems: {
          create: items,
        },
      },
    });

    // Update stock (simplistic)
    for (const item of items) {
      await prisma.product.update({
        where: { id: item.productId },
        data: { stock: { decrement: item.quantity } }
      });
    }
  }

  console.log("Created 20 transactions.");
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
