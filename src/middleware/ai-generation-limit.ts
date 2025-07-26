import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { prisma } from '@/src/lib/prisma';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export async function middleware(request: NextRequest) {
  // AI生成制限に関連するAPIエンドポイントの場合のみ処理
  if (
    request.nextUrl.pathname.startsWith('/api/ai-generation-limit') ||
    request.nextUrl.pathname.startsWith('/api/generate') ||
    request.nextUrl.pathname.startsWith('/api/cards/add')
  ) {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.next();
    }

    const userId = session.user.id;
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    // 現在の月のレコードを取得
    const currentMonthLimit = await prisma.aiGenerationLimit.findFirst({
      where: {
        userId,
        month: startOfMonth,
      },
    });

    // 前月のレコードが存在する場合は削除
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    await prisma.aiGenerationLimit.deleteMany({
      where: {
        userId,
        month: lastMonth,
      },
    });

    // 現在の月のレコードが存在しない場合は作成
    if (!currentMonthLimit) {
      await prisma.aiGenerationLimit.create({
        data: {
          userId,
          month: startOfMonth,
          count: 0,
        },
      });
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/api/ai-generation-limit/:path*',
    '/api/generate/:path*',
    '/api/cards/add/:path*',
  ],
};
