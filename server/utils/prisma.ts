import { PrismaClient } from "@prisma/client";

let prismaInstance: PrismaClient | null = null;

export function getPrismaClient(): PrismaClient {
  if (prismaInstance === null) {
    try {
      prismaInstance = new PrismaClient({
        log:
          process.env.NODE_ENV === "development"
            ? ["query", "error", "warn"]
            : ["error"],
      });

      console.log("[Prisma] ✓ Connected to Local SQLite");
    } catch (error) {
      console.error("[Prisma] ✗ Connection failed:", error);
      throw error;
    }
  }

  return prismaInstance;
}
