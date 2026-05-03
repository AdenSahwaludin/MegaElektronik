import { PrismaClient } from "@prisma/client";
import { PrismaLibSql } from "@prisma/adapter-libsql";
import { createClient } from "@libsql/client/web";

let prismaInstance: PrismaClient | null = null;

export function getPrismaClient(): PrismaClient {
  if (prismaInstance === null) {
    const isDev = process.env.NODE_ENV === "development";

    try {
      if (isDev) {
        // In development, use local SQLite (defined in DATABASE_URL in .env)
        // No adapter needed for standard SQLite
        prismaInstance = new PrismaClient({
          log: ["query", "error", "warn"],
        });
        console.log("[Prisma] ✓ Connected to Local SQLite (Development)");
      } else {
        const databaseUrl = process.env.TURSO_DATABASE_URL;
        const authToken = process.env.TURSO_AUTH_TOKEN;

        if (!databaseUrl || !authToken) {
          throw new Error("TURSO_DATABASE_URL or TURSO_AUTH_TOKEN is missing");
        }

        // Prisma schema reads env("DATABASE_URL") — set it so Prisma doesn't crash
        process.env.DATABASE_URL = databaseUrl;

        const libSql = createClient({
          url: databaseUrl,
          authToken: authToken,
        });

        const adapter = new PrismaLibSql(libSql);

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
