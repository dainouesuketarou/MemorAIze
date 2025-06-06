import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/route';
import { z } from 'zod';
import { getUniqueShareCode } from './share/route';

const createDeckSchema = z.object({
  title: z.string().min(1),
  cards: z.array(
    z.object({
      front: z.string(),
      back: z.string(),
    }),
  ),
});

const prisma = new PrismaClient();

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: '認証が必要です' }, { status: 401 });
    }

    const body = await req.json();
    const validatedData = createDeckSchema.parse(body);

    const deck = await prisma.deck.create({
      data: {
        title: validatedData.title,
        userId: session.user.id,
        cardCount: validatedData.cards.length,
        progress: 0,
        cards: {
          create: validatedData.cards.map((card, index) => ({
            front: card.front,
            back: card.back,
            order: index,
            status: 'UNLEARNED',
          })),
        },
        shareCode: await getUniqueShareCode(prisma),
      },
      include: {
        cards: true,
        groups: true,
      },
    });

    return NextResponse.json({
      success: true,
      data: deck,
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
    const decks = await prisma.deck.findMany({
      where: {
        userId: session.user.id,
      },
      include: {
        cards: {
          select: {
            id: true,
            status: true,
          },
        },
        groups: true,
      },
      orderBy: {
        lastStudied: 'desc',
      },
    });

    return NextResponse.json(decks);
  } catch (error) {
    console.error('Error fetching decks:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
