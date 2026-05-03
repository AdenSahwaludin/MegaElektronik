import { PrismaClient } from "@prisma/client";
import { PrismaLibSql } from "@prisma/adapter-libsql";
import { createClient } from "@libsql/client/web";

let prismaInstance: PrismaClient | null = null;

// Dynamic env access — prevents Nitro/Rollup from inlining values at build time
function env(key: string): string | undefined {
  return process.env[key];
}

export function getPrismaClient(): PrismaClient {
  if (prismaInstance === null) {
    const isDev = env("NODE_ENV") === "development";

    try {
      if (isDev) {
        prismaInstance = new PrismaClient({
          log: ["query", "error", "warn"],
        });
        console.log("[Prisma] ✓ Connected to Local SQLite (Development)");
      } else {
        const databaseUrl = env("TURSO_DATABASE_URL");
        const authToken = env("TURSO_AUTH_TOKEN");

        if (!databaseUrl || !authToken) {
          throw new Error(
            `TURSO credentials missing. URL=${!!databaseUrl}, TOKEN=${!!authToken}`
          );
        }

        // Set DATABASE_URL for Prisma's internal resolution
        process.env["DATABASE_URL"] = databaseUrl;

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
