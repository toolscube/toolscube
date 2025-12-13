import { env } from "@/lib/env";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@/lib/generated/prisma/client";
import { Pool } from "pg";

const connectionString = env.db.url;

const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);

const create = () => new PrismaClient({ adapter });
type PrismaX = ReturnType<typeof create>;

const g = globalThis as unknown as { prisma?: PrismaX };

export const prisma: PrismaX = g.prisma ?? create();
if (!env.isProduction) g.prisma = prisma;
