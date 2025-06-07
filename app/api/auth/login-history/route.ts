import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { getAuthSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { parseISO } from 'date-fns';
import { toZonedTime } from 'date-fns-tz';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

// ログイン履歴を記録
export async function POST(req: Request) {
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

    // リクエストボディから日時を取得（指定がない場合は現在時刻）
    const body = await req.json();
    const loginAt = body.loginAt ? new Date(body.loginAt) : new Date();

    // 日本時間でログイン時刻を記録
    const loginHistory = await prisma.loginHistory.create({
      data: {
        userId: user.id,
        loginAt: toZonedTime(loginAt, 'Asia/Tokyo'),
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
export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: '認証が必要です' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const start = searchParams.get('start');
    const end = searchParams.get('end');

    const where = {
      userId: session.user.id,
      ...(start && end
        ? {
            loginAt: {
              gte: toZonedTime(new Date(start), 'Asia/Tokyo'),
              lte: toZonedTime(new Date(end), 'Asia/Tokyo'),
            },
          }
        : {}),
    };

    const loginHistory = await prisma.loginHistory.findMany({
      where,
      orderBy: { loginAt: 'desc' },
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
