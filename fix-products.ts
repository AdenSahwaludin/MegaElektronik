import { PrismaClient } from '@prisma/client';
import { PrismaLibSql } from '@prisma/adapter-libsql';
import dotenv from 'dotenv';
dotenv.config(); // Ensure env vars are loaded

const adapter = new PrismaLibSql({
  url: process.env.TURSO_DATABASE_URL as string,
  authToken: process.env.TURSO_AUTH_TOKEN as string,
});
const prisma = new PrismaClient({ adapter });

async function main() {
  const products = await prisma.product.findMany();
  let updatedCount = 0;

  for (const product of products) {
    let newName = product.name;
    let newBrand = product.brand;

    // 1. Kapitalisasi huruf pertama pada Brand (contoh: "miyako" -> "Miyako")
    if (newBrand && newBrand.length > 0) {
      newBrand = newBrand.charAt(0).toUpperCase() + newBrand.slice(1);
    }

    // 2. Hapus Brand dari Name (Case Insensitive)
    if (newBrand && newBrand !== "No Brand") {
      const brandRegex = new RegExp(newBrand, 'gi');
      newName = newName.replace(brandRegex, '');
    }

    // 3. Hapus Model dari Name (Case Insensitive)
    if (product.model && product.model !== "Standard" && product.model !== "Portable") {
      // Escape special characters in model (e.g. quotes or dashes)
      const escapedModel = product.model.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
      const modelRegex = new RegExp(escapedModel, 'gi');
      newName = newName.replace(modelRegex, '');
    }

    // 4. Bersihkan spasi ganda yang tersisa akibat penghapusan kata
    newName = newName.replace(/\s+/g, ' ').trim();

    // Lakukan update jika ada perubahan pada nama atau brand
    if (newName !== product.name || newBrand !== product.brand) {
      console.log(`[UPDATE] ID ${product.id}:`);
      console.log(`  - Lama : ${product.name} | Merk: ${product.brand}`);
      console.log(`  - Baru : ${newName} | Merk: ${newBrand}`);
      
      await prisma.product.update({
        where: { id: product.id },
        data: { 
          name: newName,
          brand: newBrand
        }
      });
      updatedCount++;
    }
  }

  console.log(`\nSelesai! Berhasil memperbaiki ${updatedCount} produk.`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
