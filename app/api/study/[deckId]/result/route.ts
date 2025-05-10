import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(req: NextRequest, { params }: { params: { deckId: string } }) {
  try {
    const data = await req.json();
    const { results } = data; 
    if (!Array.isArray(results)) {
      return NextResponse.json({ error: 'Invalid results' }, { status: 400 });
    }
    const updatePromises = results.map((r: { id: string, mastered: boolean }) =>
      prisma.card.update({
        where: { id: r.id },
        data: { 
          status: r.mastered ? 'MASTERED' : 'STRUGGLING'
        },
      })
    );
    await Promise.all(updatePromises);

    // Deckのprogressを更新
    const deck = await prisma.deck.findUnique({
      where: { id: params.deckId },
      include: {
        cards: true,
      },
    });

    if (deck) {
      // 学習済みカード（UNLEARNED以外）のみをカウント
      const learnedCards = deck.cards.filter(card => card.status !== 'UNLEARNED');
      const masteredCount = learnedCards.filter(card => card.status === 'MASTERED').length;
      const progress = learnedCards.length > 0 ? masteredCount / learnedCards.length : 0;

      await prisma.deck.update({
        where: { id: params.deckId },
        data: { progress },
      });
    }

    return NextResponse.json({ success: true });
  } catch (e) {
    return NextResponse.json({ error: 'DB更新エラー', detail: String(e) }, { status: 500 });
  }
} 