import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
  const data = await req.json();
  const { title, description, groupIds, cardCount, progress, lastStudied, cards } = data;

  try {
    console.log("groupIds", groupIds);
    const newDeck = await prisma.deck.create({
      data: {
        title,
        description,
        cardCount,
        progress,
        lastStudied: lastStudied ? new Date(lastStudied) : null,
        groups: {
          connect: groupIds.map((id: string) => ({ id }))
        },
        cards: {
          create: (cards || []).map((c: { front: string; back: string }) => ({ front: c.front, back: c.back }))
        }
      },
      include: { groups: true, cards: true }
    });
    return NextResponse.json(newDeck);
  } catch (e) {
    return NextResponse.json({ error: 'DB保存エラー', detail: String(e) }, { status: 500 });
  }
} 

export async function GET(req: NextRequest) {
  try {
    const decks = await prisma.deck.findMany({
      include: {
        groups: true,
        cards: {
          select: {
            id: true,
            status: true,
          },
        },
      },
    });
    return NextResponse.json(decks);
  } catch (e) {
    return NextResponse.json({ error: 'デッキ取得エラー', detail: String(e) }, { status: 500 });
  }
}
