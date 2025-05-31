import { NextResponse } from 'next/server';
import { prisma, withPrisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

/* ----- JST 文字列化ユーティリティ ----- */
const toIsoJst = (d: Date) =>
  new Date(d.getTime() + 9 * 60 * 60 * 1_000) // +09:00 へ補正
    .toISOString()
    .replace('Z', '+09:00'); // ISO-8601 で明示

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const userId = session.user.id;
  const nowUtc = new Date();
  const monthUtc = new Date(nowUtc.getUTCFullYear(), nowUtc.getUTCMonth(), 1); // 月初 (UTC)

  const MONTHLY_LIMIT = Number(process.env.MONTHLY_AI_LIMIT ?? 5);

  try {
    const aiLimit = await withPrisma(async (prisma) => {
      return await prisma.aiGenerationLimit.upsert({
        where: { userId_month: { userId, month: monthUtc } },
        update: {},
        create: { userId, month: monthUtc, count: 0 },
      });
    });

    /* JST に変換して返却 */
    const resetUtc = new Date(
      monthUtc.getUTCFullYear(),
      monthUtc.getUTCMonth() + 1,
      1,
    );

    return NextResponse.json({
      success: true,
      data: {
        count: aiLimit.count,
        limit: MONTHLY_LIMIT,
        resetAt: toIsoJst(resetUtc),
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
