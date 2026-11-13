import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../generated/prisma/client.js";

const connectionString =
  process.env.DATABASE_URL ||
  process.env.STORAGE_DATABASE_URL_POOLED ||
  process.env.STORAGE_DATABASE_URL ||
  process.env.STORAGE_POSTGRES_URL ||
  process.env.STORAGE_PRISMA_DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL (or STORAGE_DATABASE_URL_POOLED) must be set to initialize Prisma");
}

const adapter = new PrismaPg({ connectionString });

export const prisma = new PrismaClient({ adapter });
