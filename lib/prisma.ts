// lib/prisma.ts - ENHANCED VERSION (optional but recommended)
import { PrismaClient } from "@prisma/client";

const globalForPrisma = global as unknown as { prisma: PrismaClient };

// Create a PrismaClient instance only if DATABASE_URL exists
const createPrismaClient = () => {
  if (!process.env.DATABASE_URL) {
    console.warn('DATABASE_URL not set, using mock PrismaClient');
    // Return a mock client during build
    return {
      user: { 
        findUnique: () => Promise.resolve(null),
        create: () => Promise.resolve({ id: 'mock-id' }),
      },
      specialist: { 
        create: () => Promise.resolve({}),
      },
      $transaction: (fn: any) => fn({
        user: { 
          findUnique: () => Promise.resolve(null),
          create: () => Promise.resolve({ id: 'mock-id' }),
        },
        specialist: { 
          create: () => Promise.resolve({}),
        },
      }),
      $disconnect: () => Promise.resolve(),
    } as any;
  }
  
  return new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["query"] : [],
  });
};

export const prisma = globalForPrisma.prisma || createPrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;