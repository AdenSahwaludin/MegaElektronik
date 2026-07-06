import { getPrismaClient } from "../server/utils/prisma";

// Force production mode to connect to Turso
process.env.NODE_ENV = "production";

const prisma = getPrismaClient();

async function main() {
  console.log("Updating standar models to - in PRODUCTION DB...");

  const products = await prisma.product.findMany();
  let updatedCount = 0;

  for (const p of products) {
    if (p.model && p.model.toLowerCase() === 'standar') {
      await prisma.product.update({
        where: { id: p.id },
        data: { model: ' ' }
      });
      updatedCount++;
    }
  }

  console.log(`Updated ${updatedCount} products model from 'standar' to ' '.`);
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    // There might be some issue with Prisma LibSQL disconnect, but we try
    // @ts-ignore
    if (prisma.$disconnect) {
      await prisma.$disconnect();
    }
  });
