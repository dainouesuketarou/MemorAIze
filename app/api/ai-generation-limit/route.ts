import { NextResponse } from 'next/server';
import { prisma, withPrisma } from '@/src/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

/* ----- JST 文字列化ユーティリティ ----- */
const toIsoJst = (d: Date) =>
  new Date(d.getTime() + 9 * 60 * 60 * 1_000) // +09:00 へ補正
    .toISOString()
    .replace('Z', '+09:00');

/* ----- JST 月初日取得 ----- */
const getJstMonthStart = () => {
  const now = new Date();
  const utc = now.getTime() + now.getTimezoneOffset() * 60000;
  const jst = new Date(utc + 9 * 3600 * 1000);
  return new Date(jst.getFullYear(), jst.getMonth(), 1);
};

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const userId = session.user.id;
  const monthJst = getJstMonthStart();
  const MONTHLY_LIMIT = Number(process.env.MONTHLY_AI_LIMIT ?? 5);

  try {
    const aiLimit = await withPrisma(async (prisma) => {
      // 既存のレコードを検索（同じ月のものを全て取得）
      const existingLimits = await prisma.aiGenerationLimit.findMany({
        where: {
          userId,
          month: {
            gte: monthJst,
            lt: new Date(monthJst.getFullYear(), monthJst.getMonth() + 1, 1),
          },
        },
      });

      // 複数のレコードが存在する場合は、最初のレコードを残して他を削除
      if (existingLimits.length > 1) {
        const [keepLimit, ...deleteLimits] = existingLimits;
        await Promise.all(
          deleteLimits.map((limit) =>
            prisma.aiGenerationLimit.delete({
              where: { id: limit.id },
            }),
          ),
        );
        return keepLimit;
      }

      // 1つのレコードが存在する場合はそれを返す
      if (existingLimits.length === 1) {
        return existingLimits[0];
      }

      // レコードが存在しない場合は新規作成
      return await prisma.aiGenerationLimit.create({
        data: {
          userId,
          month: monthJst,
          count: 0,
        },
      });
    });

    /* 次月の月初日（JST）を計算 */
    const resetJst = new Date(
      monthJst.getFullYear(),
      monthJst.getMonth() + 1,
      1,
    );

    return NextResponse.json({
      success: true,
      limit: {
        id: aiLimit.id,
        userId: aiLimit.userId,
        monthlyLimit: MONTHLY_LIMIT,
        monthlyUsage: aiLimit.count,
        lastResetMonth: resetJst,
      },
    });
  } catch (error) {
    console.error('Error in AI generation limit API:', error);
    return NextResponse.json(
      { success: false, error: 'Internal Server Error' },
      { status: 500 },
    );
  }
}
