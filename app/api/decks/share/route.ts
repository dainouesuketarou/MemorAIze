import { NextRequest, NextResponse } from 'next/server';
import { Deck, PrismaClient } from '@prisma/client';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';

const prisma = new PrismaClient();

function generateShareCode(length = 6) {
  const chars =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let code = '';
  for (let i = 0; i < length; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

// 共有IDの重複をチェックして、重複しない共有IDを生成する
export async function getUniqueShareCode(prisma: PrismaClient) {
  let code;
  let exists = true;
  while (exists) {
    code = generateShareCode();
    exists = !!(await prisma.deck.findUnique({ where: { shareCode: code } }));
  }
  return code;
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: '認証が必要です' }, { status: 401 });
    }
    const { shareCode } = await req.json();
    if (!shareCode) {
      return NextResponse.json({ error: '共有IDが必要です' }, { status: 400 });
    }
    // 共有IDでDeckを検索
    const originalDeck = await prisma.deck.findUnique({
      where: { shareCode },
      include: { cards: true },
    });
    if (!originalDeck) {
      return NextResponse.json(
        { error: '該当する暗記帳が見つかりません' },
        { status: 404 },
      );
    }
    // 自分のDeckはインポート不可
    if (originalDeck.userId === session.user.id) {
      return NextResponse.json(
        { error: '自分の暗記帳はインポートできません' },
        { status: 400 },
      );
    }
    // 新しいshareCodeを生成
    const newShareCode = await getUniqueShareCode(prisma);
    // Deckとcardsを複製
    const newDeck = await prisma.deck.create({
      data: {
        title: originalDeck.title,
        description: originalDeck.description,
        userId: session.user.id,
        cardCount: originalDeck.cardCount,
        progress: 0,
        shareCode: newShareCode,
        cards: {
          create: originalDeck.cards.map((card) => ({
            front: card.front,
            back: card.back,
            order: card.order,
            status: card.status,
            favorite: card.favorite,
          })),
        },
      },
      include: { cards: true },
    });
    return NextResponse.json({ success: true, data: newDeck });
  } catch (error) {
    console.error('Error importing deck:', error);
    return NextResponse.json(
      { error: 'インポートに失敗しました' },
      { status: 500 },
    );
  }
}
