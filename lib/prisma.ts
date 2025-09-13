import { PrismaClient } from "@prisma/client";
import { withAccelerate } from "@prisma/extension-accelerate";

const create = () => new PrismaClient().$extends(withAccelerate());
type PrismaX = ReturnType<typeof create>;
const g = globalThis as unknown as { prisma?: PrismaX };

export const prisma: PrismaX = g.prisma ?? create();
if (process.env.NODE_ENV !== "production") g.prisma = prisma;