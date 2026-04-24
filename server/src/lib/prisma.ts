import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function connectDB(): Promise<boolean> {
  try {
    await prisma.$connect();
    console.log('✅ Database connected successfully');
    return true;
  } catch (error) {
    console.error('❌ Database connection failed:', (error as Error).message);
    return false;
  }
}

export default prisma;
