import { NextRequest, NextResponse } from 'next/server';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { getServerSession } from 'next-auth';
import { container } from '@/src/infrastructure/container/di-container';
import { z } from 'zod';

const updateDeckSchema = z.object({
  title: z.string().min(1).optional(),
  description: z.string().optional(),
  groupIds: z.array(z.string()).optional(),
});

export async function PATCH(
  req: NextRequest,
  { params }: { params: { deckId: string } },
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: '認証が必要です' }, { status: 401 });
    }

    const body = await req.json();
    const validatedData = updateDeckSchema.parse(body);
    const deckId = params.deckId;

    // タイトルまたは説明の更新
    if (validatedData.title || validatedData.description !== undefined) {
      const updateDeckUseCase = container.getUpdateDeckUseCase();
      const result = await updateDeckUseCase.execute({
        deckId,
        title: validatedData.title,
        description: validatedData.description,
      });

      if (!result.success) {
        return NextResponse.json({ error: result.error }, { status: 400 });
      }
    }

    // グループIDの更新
    if (validatedData.groupIds !== undefined) {
      const updateDeckGroupsUseCase = container.getUpdateDeckGroupsUseCase();
      const result = await updateDeckGroupsUseCase.execute({
        deckId,
        userId: session.user.id,
        groupIds: validatedData.groupIds,
      });

      if (!result.success) {
        return NextResponse.json({ error: result.error }, { status: 400 });
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating deck:', error);
    return NextResponse.json(
      {
        error: 'デッキの更新に失敗しました',
        details:
          error instanceof Error ? error.message : '不明なエラーが発生しました',
      },
      { status: 400 },
    );
  }
}

export async function GET(
  req: NextRequest,
  { params }: { params: { deckId: string } },
) {
  try {
    const getDeckUseCase = container.getGetDeckUseCase();
    const result = await getDeckUseCase.execute({
      deckId: params.deckId,
    });

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 404 });
    }

    return NextResponse.json({
      ...result.deck,
      stats: result.stats,
    });
  } catch (error) {
    console.error('Error fetching deck:', error);
    return NextResponse.json(
      { error: 'デッキの取得に失敗しました', detail: String(error) },
      { status: 500 },
    );
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { deckId: string } },
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const deleteDeckUseCase = container.getDeleteDeckUseCase();
    const result = await deleteDeckUseCase.execute({
      deckId: params.deckId,
      userId: session.user.id,
    });

    if (!result.success) {
      return new NextResponse(result.error || 'Internal error', {
        status: 500,
      });
    }

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error('[DECK_DELETE]', error);
    return new NextResponse('Internal error', { status: 500 });
  }
}
