import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/route';
import { z } from 'zod';
import { container } from '@/src/infrastructure/container/di-container';

const createDeckSchema = z.object({
  title: z.string().min(1),
  cards: z.array(
    z.object({
      front: z.string(),
      back: z.string(),
    }),
  ),
  groupIds: z.array(z.string()).optional(),
});

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: '認証が必要です' }, { status: 401 });
    }

    const body = await req.json();
    const validatedData = createDeckSchema.parse(body);

    // ユースケースを実行
    const createDeckUseCase = container.getCreateDeckUseCase();
    const result = await createDeckUseCase.execute({
      title: validatedData.title,
      cards: validatedData.cards,
      userId: session.user.id,
      groupIds: validatedData.groupIds,
    });

    if (!result.success) {
      return NextResponse.json(
        {
          error: result.error,
        },
        { status: 400 },
      );
    }

    return NextResponse.json({
      success: true,
      data: result.deck,
    });
  } catch (error) {
    console.error('Error creating deck:', error);
    return NextResponse.json(
      {
        error: 'デッキの作成に失敗しました',
        details:
          error instanceof Error ? error.message : '不明なエラーが発生しました',
      },
      { status: 400 },
    );
  }
}

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  try {
    const deckRepository = container.getDeckRepository();
    const decks = await deckRepository.findByUserId(session.user.id);

    return NextResponse.json(decks);
  } catch (error) {
    console.error('Error fetching decks:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
