import { NextResponse } from 'next/server';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { getServerSession } from 'next-auth';
import { prisma, withPrisma } from '@/src/lib/prisma';

export async function POST(
  req: Request,
  { params }: { params: { deckId: string } },
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    const body = await req.json();
    const { groupName } = body;

    if (!groupName) {
      return new NextResponse('Group name is required', { status: 400 });
    }

    const result = await withPrisma(async (prisma) => {
      const deck = await prisma.deck.findUnique({
        where: {
          id: params.deckId,
          userId: session.user.id,
        },
      });

      if (!deck) {
        throw new Error('Deck not found');
      }

      // グループを作成または既存のグループを取得
      const group = await prisma.group.upsert({
        where: {
          userId: body.userId,
          name: groupName,
        },
        create: {
          name: groupName,
          userId: session.user.id,
        },
        update: {},
      });

      // デッキをグループに追加
      await prisma.deck.update({
        where: {
          id: params.deckId,
        },
        data: {
          groups: {
            connect: {
              id: group.id,
            },
          },
        },
      });

      return group;
    });

    return new NextResponse(null, { status: 200 });
  } catch (error) {
    console.error('[DECK_GROUP]', error);
    return new NextResponse('Internal error', { status: 500 });
  }
}
