import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { getAuthSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { parseISO } from 'date-fns';
import { toZonedTime } from 'date-fns-tz';

// ログイン履歴を記録
export async function POST() {
  try {
    const session = await getAuthSession();
    if (!session?.user?.email) {
      return NextResponse.json({ error: '認証が必要です' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'ユーザーが見つかりません' },
        { status: 404 },
      );
    }

    // 日本時間でログイン時刻を記録
    const loginHistory = await prisma.loginHistory.create({
      data: {
        userId: user.id,
        loginAt: toZonedTime(new Date(), 'Asia/Tokyo'),
      },
    });

    return NextResponse.json(loginHistory);
  } catch (error) {
    console.error('ログイン履歴の記録に失敗しました:', error);
    return NextResponse.json(
      { error: 'ログイン履歴の記録に失敗しました' },
      { status: 500 },
    );
  }
}

// 特定の期間のログイン履歴を取得
export async function GET(request: Request) {
  try {
    const session = await getAuthSession();
    if (!session?.user?.email) {
      return NextResponse.json({ error: '認証が必要です' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const start = searchParams.get('start');
    const end = searchParams.get('end');

    if (!start || !end) {
      return NextResponse.json(
        { error: '開始日と終了日の指定が必要です' },
        { status: 400 },
      );
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'ユーザーが見つかりません' },
        { status: 404 },
      );
    }

    const startDate = toZonedTime(parseISO(start), 'Asia/Tokyo');
    const endDate = toZonedTime(parseISO(end), 'Asia/Tokyo');

    const loginHistory = await prisma.loginHistory.findMany({
      where: {
        userId: user.id,
        loginAt: {
          gte: startDate,
          lte: endDate,
        },
      },
      orderBy: {
        loginAt: 'desc',
      },
    });

    return NextResponse.json(loginHistory);
  } catch (error) {
    console.error('ログイン履歴の取得に失敗しました:', error);
    return NextResponse.json(
      { error: 'ログイン履歴の取得に失敗しました' },
      { status: 500 },
    );
  }
}
