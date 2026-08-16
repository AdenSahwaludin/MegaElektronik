import { PrismaClient } from "@prisma/client";
import { PrismaLibSql } from "@prisma/adapter-libsql";
import dotenv from "dotenv";
dotenv.config();

const adapter = new PrismaLibSql({
  url: process.env.TURSO_DATABASE_URL as string,
  authToken: process.env.TURSO_AUTH_TOKEN as string,
});
const prisma = new PrismaClient({ adapter });

const SKIP_BRANDS = new Set(["", "-", "no brand", "no-brand"]);

async function main() {
  const products = await prisma.product.findMany({
    orderBy: { name: "asc" },
  });

  let updatedCount = 0;
  let skippedCount = 0;

  for (const product of products) {
    const brand = (product.brand || "").trim();
    const name = (product.name || "").trim();

    // Skip jika brand kosong / bukan merek
    if (!brand || SKIP_BRANDS.has(brand.toLowerCase())) {
      skippedCount++;
      continue;
    }

    // Skip jika nama sudah mengandung brand (case insensitive)
    if (name.toLowerCase().includes(brand.toLowerCase())) {
      skippedCount++;
      continue;
    }

    const newName = `${name} ${brand}`;

    console.log(`[UPDATE] ID ${product.id}:`);
    console.log(`  - Lama : ${product.name} | Merk: ${product.brand}`);
    console.log(`  - Baru : ${newName}`);

    await prisma.product.update({
      where: { id: product.id },
      data: { name: newName },
    });
    updatedCount++;
  }

  console.log(`\nSelesai! ${updatedCount} produk diperbaiki, ${skippedCount} produk dilewati.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    // @ts-ignore
    if (prisma.$disconnect) {
      await prisma.$disconnect();
    }
  });