import { PrismaClient } from "@prisma/client";
import { withAccelerate } from "@prisma/extension-accelerate";

const createPrisma = () => new PrismaClient().$extends(withAccelerate());
type PrismaX = ReturnType<typeof createPrisma>;

const g = globalThis as unknown as { prisma?: PrismaX };

export const prisma: PrismaX = g.prisma ?? createPrisma();

if (process.env.NODE_ENV !== "production") {
  g.prisma = prisma;
}

export function getPrisma(): PrismaX {
  return prisma;
}
