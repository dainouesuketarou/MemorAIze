import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(req: NextRequest, { params }: { params: { deckId: string } }) {
  try {
    // Deckのprogressを取得
    const deck = await prisma.deck.findUnique({ where: { id: params.deckId } });
    if (!deck) {
      return NextResponse.json({ error: 'Deck not found' }, { status: 404 });
    }
    // progressは0~1のfloatなので、0~100のintに変換
    const progress = Math.round((deck.progress ?? 0) * 100);

    // 学習履歴の記録
    const history = await prisma.studyHistory.create({
      data: {
        deckId: params.deckId,
        progress,
      },
    });

    // デッキの最終学習日時を更新
    await prisma.deck.update({
      where: { id: params.deckId },
      data: { lastStudied: new Date() },
    });

    return NextResponse.json(history);
  } catch (e) {
    return NextResponse.json(
      { error: '学習履歴の記録に失敗しました', detail: String(e) },
      { status: 500 }
    );
  }
} 