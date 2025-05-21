import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';

interface SaveRequest {
  deckId: string;
  title?: string;
  cards: Array<{ front: string; back: string }>;
}

export async function POST(req: Request) {
  // 認証チェック
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json(
      { success: false, error: 'Unauthorized' },
      { status: 401 },
    );
  }

  let body: SaveRequest;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { success: false, error: 'Invalid JSON' },
      { status: 400 },
    );
  }

  const { deckId, cards } = body;

  console.log('cards', cards);

  // バリデーション
  if (
    typeof deckId !== 'string' ||
    !Array.isArray(cards) ||
    cards.length === 0
  ) {
    return NextResponse.json(
      { success: false, error: 'deckId と cards は必須です' },
      { status: 400 },
    );
  }
  for (const c of cards) {
    if (!c.front?.trim() || !c.back?.trim()) {
      return NextResponse.json(
        { success: false, error: 'front/back が空です' },
        { status: 400 },
      );
    }
  }

  // カードを一括作成
  await prisma.card.createMany({
    data: cards.map((c, index) => ({
      deckId,
      front: c.front.trim(),
      back: c.back.trim(),
      status: 'UNLEARNED',
      favorite: false,
      order: index,
    })),
  });

  return NextResponse.json({ success: true });
}
