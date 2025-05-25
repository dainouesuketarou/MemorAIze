import { NextResponse } from 'next/server';
import { getAuthSession } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { StudyPurpose } from '@prisma/client';

export async function POST(request: Request) {
  try {
    const session = await getAuthSession();
    if (!session?.user?.email) {
      return NextResponse.json({ error: '認証が必要です' }, { status: 401 });
    }

    const { username, purposes } = await request.json();

    // ユーザー情報を更新
    const user = await prisma.user.update({
      where: { email: session.user.email },
      data: {
        name: username,
        isOnboarded: true,
        studyPurposes: {
          create: purposes.map((purpose: StudyPurpose) => ({
            purpose,
          })),
        },
      },
    });

    return NextResponse.json(user);
  } catch (error) {
    console.error('オンボーディングの保存に失敗しました:', error);
    return NextResponse.json(
      { error: 'オンボーディングの保存に失敗しました' },
      { status: 500 },
    );
  }
}
