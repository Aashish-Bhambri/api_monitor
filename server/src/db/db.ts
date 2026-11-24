import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";

const connectionString =
  process.env.DATABASE_URL ||
  process.env.STORAGE_DATABASE_URL_POOLED ||
  process.env.STORAGE_DATABASE_URL ||
  process.env.STORAGE_POSTGRES_URL ||
  process.env.STORAGE_PRISMA_DATABASE_URL;

if (!connectionString) {
  console.error("CRITICAL ERROR: DATABASE_URL environment variable is missing!");
}

const safeConnectionString =
  connectionString || "postgres://dummy:dummy@localhost:5432/dummy?sslmode=disable";

const adapter = new PrismaPg({ connectionString: safeConnectionString });

export const prisma = new PrismaClient({ adapter });
