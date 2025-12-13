import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import { env } from "@/lib/env";

const connectionString = env.db.url;

const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);

const create = () => new PrismaClient({ adapter });
type PrismaX = ReturnType<typeof create>;

const g = globalThis as unknown as { prisma?: PrismaX };

export const prisma: PrismaX = g.prisma ?? create();
if (!env.isProduction) g.prisma = prisma;
