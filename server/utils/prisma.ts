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

        const libSql = createClient({
          url: databaseUrl,
          authToken: authToken,
        });

        const adapter = new PrismaLibSql(libSql);

        // Pass a dummy SQLite URL to satisfy Prisma's internal URL validator.
        // The adapter handles ALL actual database communication with Turso.
        prismaInstance = new PrismaClient({
          adapter,
          datasources: {
            db: {
              url: "file:./prisma/production.db",
            },
          },
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
