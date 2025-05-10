import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
  try {
    const { deckId, front, back } = await req.json();
    if (!deckId || !front || !back) {
      return NextResponse.json({ error: 'deckId, front, backは必須です' }, { status: 400 });
    }

    // トランザクションで一括処理
    const result = await prisma.$transaction(async (tx) => {
      // カード作成
      const card = await tx.card.create({
        data: {
          deckId: typeof deckId === 'string' ? deckId : String(deckId),
          front,
          back,
          status: 'UNLEARNED', // 新規カードは未学習状態
        },
      });

      // StudyHistory作成
      await tx.studyHistory.create({
        data: {
          deckId: typeof deckId === 'string' ? deckId : String(deckId),
          progress: 0, // 新規カードは進捗0
        },
      });

      // Deckの進捗度更新
      const deck = await tx.deck.findUnique({
        where: { id: typeof deckId === 'string' ? deckId : String(deckId) },
        include: {
          cards: true,
        },
      });

      if (deck) {
        // 全カード数に対する覚えたカードの割合を計算
        const totalCards = deck.cards.length;
        const masteredCount = deck.cards.filter(card => card.status === 'MASTERED').length;
        const progress = totalCards > 0 ? masteredCount / totalCards : 0;

        await tx.deck.update({
          where: { id: deck.id },
          data: {
            cardCount: totalCards,
            progress: progress,
          },
        });
      }

      return card;
    });

    return NextResponse.json(result);
  } catch (e) {
    return NextResponse.json({ error: 'カード追加エラー', detail: String(e) }, { status: 500 });
  }
} 