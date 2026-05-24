import { PrismaClient } from "@prisma/client";
import { PrismaLibSql } from "@prisma/adapter-libsql";

let prismaInstance: PrismaClient | null = null;

export function getPrismaClient(): PrismaClient {
  if (prismaInstance === null) {
    const isDev = process.env.NODE_ENV === "development";

    try {
      if (isDev) {
        // In development, use local SQLite (defined in DATABASE_URL in .env)
        // No adapter needed for standard SQLite
        prismaInstance = new PrismaClient({
          log: ["error", "warn"],
        });
        console.log("[Prisma] ✓ Connected to Local SQLite (Development)");
      } else {
        // In production, use Turso with LibSQL adapter
        const databaseUrl = process.env.TURSO_DATABASE_URL;
        const authToken = process.env.TURSO_AUTH_TOKEN;

        if (!databaseUrl || !authToken) {
          throw new Error("TURSO credentials missing for production");
        }

        // Prisma schema might rely on env("DATABASE_URL")
        process.env.DATABASE_URL = databaseUrl;

        const adapter = new PrismaLibSql({
          url: databaseUrl,
          authToken: authToken,
        });

        prismaInstance = new PrismaClient({
          adapter,
          log: ["error", "warn"],
        });

        console.log("[Prisma] ✓ Connected to Turso (Production)");
      }
    } catch (error) {
      console.error("[Prisma] ✗ Connection failed:", error);
      throw error;
    }
  }

  return prismaInstance;
}
