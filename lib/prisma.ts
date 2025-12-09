import { env } from "@/lib/env";
import { PrismaClient } from "@prisma/client";
import { withAccelerate } from "@prisma/extension-accelerate";

const create = () => new PrismaClient().$extends(withAccelerate());
type PrismaX = ReturnType<typeof create>;

const g = globalThis as unknown as { prisma?: PrismaX };

export const prisma: PrismaX = g.prisma ?? create();
if (!env.isProduction) g.prisma = prisma;
