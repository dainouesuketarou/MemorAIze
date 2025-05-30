import { NextResponse } from 'next/server';
import { getAuthSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const session = await getAuthSession();
    if (!session?.user?.email) {
      return NextResponse.json({ error: '認証が必要です' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { isOnboarded: true },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'ユーザーが見つかりません' },
        { status: 404 },
      );
    }

    return NextResponse.json({ isOnboarded: user.isOnboarded });
  } catch (error) {
    console.error('オンボーディング状態の確認に失敗しました:', error);
    return NextResponse.json(
      { error: 'オンボーディング状態の確認に失敗しました' },
      { status: 500 },
    );
  }
}
