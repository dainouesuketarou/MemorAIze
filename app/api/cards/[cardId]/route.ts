import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function DELETE(
  req: NextRequest,
  { params }: { params: { cardId: string } },
) {
  try {
    const { cardId } = params;
    const { deckId } = await req.json();

    // カードの存在確認
    const card = await prisma.card.findUnique({
      where: { id: cardId },
    });

    if (!card) {
      return NextResponse.json(
        { error: 'カードが見つかりません' },
        { status: 404 },
      );
    }

    // トランザクションでカード削除とデッキの更新を実行
    await prisma.$transaction(async (tx) => {
      // デッキの情報を取得（カード削除前）
      const deck = await tx.deck.findUnique({
        where: { id: deckId },
        include: {
          cards: true,
        },
      });

      if (!deck) {
        throw new Error('デッキが見つかりません');
      }

      // カードの削除
      await tx.card.delete({
        where: { id: cardId },
      });

      // デッキの更新
      const totalCards = deck.cards.length - 1; // 削除するカードを除いた数
      const masteredCount = deck.cards.filter(
        (card) => card.status === 'MASTERED',
      ).length;
      const progress = totalCards > 0 ? masteredCount / totalCards : 0;

      await tx.deck.update({
        where: { id: deckId },
        data: {
          cardCount: totalCards,
          progress: progress,
        },
      });
    });

    return NextResponse.json({ success: true });
  } catch (e) {
    console.error('[CARD_DELETE]', e);
    return NextResponse.json(
      { error: 'カード削除エラー', detail: String(e) },
      { status: 500 },
    );
  }
}
