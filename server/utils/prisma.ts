import { PrismaClient } from "@prisma/client";
import { PrismaLibSQL } from "@prisma/adapter-libsql";
import { createClient } from "@libsql/client/web";

let prismaInstance: PrismaClient | null = null;

export function getPrismaClient(): PrismaClient {
  if (prismaInstance === null) {
    try {
      const databaseUrl = process.env.TURSO_DATABASE_URL;
      const authToken = process.env.TURSO_AUTH_TOKEN;

      if (!databaseUrl || !authToken) {
        throw new Error(
          `Missing TURSO credentials. TURSO_DATABASE_URL=${!!databaseUrl}, TURSO_AUTH_TOKEN=${!!authToken}`
        );
      }

      const libSql = createClient({
        url: databaseUrl,
        authToken: authToken,
      });

      const adapter = new PrismaLibSQL(libSql);

      prismaInstance = new PrismaClient({
        adapter,
        log: ["error", "warn"],
      });

      console.log("[Prisma] ✓ Connected to Turso");
    } catch (error) {
      console.error("[Prisma] ✗ Connection failed:", error);
      throw error;
    }
  }

  return prismaInstance;
}
