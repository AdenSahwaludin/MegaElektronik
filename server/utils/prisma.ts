import { PrismaClient } from "@prisma/client";
import { PrismaLibSql } from "@prisma/adapter-libsql";

let prismaInstance: PrismaClient | null = null;

export function getPrismaClient(): PrismaClient {
  if (prismaInstance === null) {
    const databaseUrl = process.env.TURSO_DATABASE_URL;
    const authToken = process.env.TURSO_AUTH_TOKEN;

    if (!databaseUrl) {
      throw new Error("TURSO_DATABASE_URL environment variable is not set");
    }

    if (!authToken) {
      throw new Error("TURSO_AUTH_TOKEN environment variable is not set");
    }

    try {
      // PrismaLibSql adapter expects the config object with url and authToken
      const adapter = new PrismaLibSql({
        url: databaseUrl,
        authToken: authToken,
      });

      prismaInstance = new PrismaClient({
        adapter,
        log:
          process.env.NODE_ENV === "development"
            ? ["query", "error", "warn"]
            : ["error"],
      });

      console.log("[Prisma] ✓ Connected to Turso");
    } catch (error) {
      console.error("[Prisma] ✗ Connection failed:", error);
      throw error;
    }
  }

  return prismaInstance;
}
