import { PrismaClient } from '@prisma/client';

declare global {
  var prisma: PrismaClient | undefined;
}

const prismaClientSingleton = () => {
  return new PrismaClient({
    log: ['error'],
    datasources: {
      db: {
        url: process.env.DATABASE_URL,
      },
    },
  });
};

// グローバルなPrismaクライアントインスタンスを管理
export const prisma = globalThis.prisma ?? prismaClientSingleton();

// 開発環境でのみグローバルインスタンスを保持
if (process.env.NODE_ENV !== 'production') {
  globalThis.prisma = prisma;
}

// サーバーレス環境での接続管理のためのヘルパー関数
export async function withPrisma<T>(
  fn: (prisma: PrismaClient) => Promise<T>,
): Promise<T> {
  try {
    return await fn(prisma);
  } catch (error) {
    console.error('Prisma error:', error);
    throw error;
  }
}
