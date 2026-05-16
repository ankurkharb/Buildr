import { PrismaClient } from "@/generated/prisma"; 
const globalForPrisma = global as unknown as {
    prisma: PrismaClient
}
//its related to hot reload;
  export const prisma = globalForPrisma.prisma || new PrismaClient()
if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
