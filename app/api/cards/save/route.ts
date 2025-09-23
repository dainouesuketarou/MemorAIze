import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { container } from '@/src/infrastructure/container/di-container';
import { z } from 'zod';

const saveCardsSchema = z.object({
  deckId: z.string().min(1, 'デッキIDは必須です'),
  cards: z
    .array(
      z.object({
        front: z.string().min(1, 'カードの表は必須です'),
        back: z.string().min(1, 'カードの裏は必須です'),
      }),
    )
    .min(1, '少なくとも1つのカードが必要です'),
});

export async function POST(req: Request) {
  try {
    // 認証チェック
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: '認証が必要です' },
        { status: 401 },
      );
    }

    const body = await req.json();
    const validatedData = saveCardsSchema.parse(body);

    const saveCardsUseCase = container.getSaveCardsUseCase();
    const result = await saveCardsUseCase.execute({
      deckId: validatedData.deckId,
      cards: validatedData.cards,
    });

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 400 },
      );
    }

    return NextResponse.json({
      success: true,
      data: result.cards,
    });
  } catch (error) {
    console.error('Error saving cards:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'カードの保存に失敗しました',
        details:
          error instanceof Error ? error.message : '不明なエラーが発生しました',
      },
      { status: 400 },
    );
  }
}
