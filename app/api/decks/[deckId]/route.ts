import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { getServerSession } from 'next-auth';

const prisma = new PrismaClient();

export async function PATCH(
  req: NextRequest,
  { params }: { params: { deckId: string } },
) {
  const deckId = params.deckId;
  const data = await req.json();
  const { groupIds, title, description } = data; // 新しいグループID配列

  if (title) {
    try {
      const updated = await prisma.deck.update({
        where: { id: deckId },
        data: { title },
      });
    } catch (e) {
      return NextResponse.json(
        { error: 'タイトル更新エラー', detail: String(e) },
        { status: 500 },
      );
    }
  }
  if (description) {
    try {
      const updated = await prisma.deck.update({
        where: { id: deckId },
        data: { description },
      });
    } catch (e) {
      return NextResponse.json(
        { error: '説明更新エラー', detail: String(e) },
        { status: 500 },
      );
    }
  }
  if (groupIds) {
    try {
      const updated = await prisma.deck.update({
        where: { id: deckId },
        data: {
          groups: {
            set: groupIds.map((id: string) => ({ id })),
          },
        },
        include: { groups: true },
      });
      return NextResponse.json({ success: true, updated });
    } catch (e) {
      return NextResponse.json(
        { error: 'グループ更新エラー', detail: String(e) },
        { status: 500 },
      );
    }
  }
  return NextResponse.json({ success: true });
}

export async function GET(
  req: NextRequest,
  { params }: { params: { deckId: string } },
) {
  try {
    const deck = await prisma.deck.findUnique({
      where: { id: params.deckId },
      include: { cards: true },
    });
    if (!deck) {
      return NextResponse.json({ error: 'Deck not found' }, { status: 404 });
    }
    const totalCards = deck.cards.length;
    const masteredCount = deck.cards.filter(
      (card) => card.status === 'MASTERED',
    ).length;
    const strugglingCount = deck.cards.filter(
      (card) => card.status === 'STRUGGLING',
    ).length;
    const unlearnedCount = deck.cards.filter(
      (card) => card.status === 'UNLEARNED',
    ).length;
    const stats = {
      mastered:
        totalCards > 0 ? Math.round((masteredCount / totalCards) * 100) : 0,
      struggling:
        totalCards > 0 ? Math.round((strugglingCount / totalCards) * 100) : 0,
      unlearned:
        totalCards > 0 ? Math.round((unlearnedCount / totalCards) * 100) : 0,
    };
    const progressHistory = await prisma.studyHistory.findMany({
      where: { deckId: params.deckId },
      orderBy: { createdAt: 'desc' },
      take: 30,
      select: { progress: true, createdAt: true },
    });
    return NextResponse.json({ ...deck, stats, progressHistory });
  } catch (e) {
    return NextResponse.json(
      { error: 'DB取得エラー', detail: String(e) },
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

    const deckId = params.deckId;

    // デッキの存在確認と所有者確認
    const deck = await prisma.deck.findUnique({
      where: {
        id: deckId,
        userId: session.user.id,
      },
    });

    if (!deck) {
      return new NextResponse('Deck not found', { status: 404 });
    }

    // トランザクションで関連データを削除
    await prisma.$transaction(async (tx) => {
      // デッキに関連するカードを削除
      await tx.card.deleteMany({
        where: {
          deckId: deckId,
        },
      });

      // デッキに関連する学習履歴を削除
      await tx.studyHistory.deleteMany({
        where: {
          deckId: deckId,
        },
      });

      // デッキを削除
      await tx.deck.delete({
        where: {
          id: deckId,
        },
      });
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error('[DECK_DELETE]', error);
    return new NextResponse('Internal error', { status: 500 });
  }
}
