import { mkdirSync } from "node:fs";
import path from "node:path";
import { PrismaClient } from "@prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

function createClient() {
  const dbPath = process.env.DATABASE_PATH;
  const url =
    process.env.DATABASE_URL ??
    (dbPath ? `file:${dbPath}` : "file:./dev.db");
  if (!process.env.DATABASE_URL && dbPath) {
    mkdirSync(path.dirname(dbPath), { recursive: true });
  }
  const adapter = new PrismaBetterSqlite3({ url });
  return new PrismaClient({ adapter });
}

export const prisma = globalForPrisma.prisma ?? createClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;