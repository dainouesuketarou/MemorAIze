import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { getServerSession } from "next-auth";

const prisma = new PrismaClient();

export async function PATCH(req: NextRequest, { params }: { params: { deckId: string } }) {
  const deckId = params.deckId;
  const data = await req.json();
  const { groupIds } = data; // 新しいグループID配列

  try {
    const updated = await prisma.deck.update({
      where: { id: deckId },
      data: {
        groups: {
          set: groupIds.map((id: string) => ({ id }))
        }
      },
      include: { groups: true }
    });
    return NextResponse.json(updated);
  } catch (e) {
    return NextResponse.json({ error: 'グループ更新エラー', detail: String(e) }, { status: 500 });
  }
}

export async function GET(req: NextRequest, { params }: { params: { deckId: string } }) {
  try {
    const deck = await prisma.deck.findUnique({
      where: { id: params.deckId },
      include: { cards: true },
    });
    if (!deck) {
      return NextResponse.json({ error: 'Deck not found' }, { status: 404 });
    }
    const totalCards = deck.cards.length;
    const masteredCount = deck.cards.filter(card => card.status === 'MASTERED').length;
    const strugglingCount = deck.cards.filter(card => card.status === 'STRUGGLING').length;
    const unlearnedCount = deck.cards.filter(card => card.status === 'UNLEARNED').length;
    const stats = {
      mastered: totalCards > 0 ? Math.round((masteredCount / totalCards) * 100) : 0,
      struggling: totalCards > 0 ? Math.round((strugglingCount / totalCards) * 100) : 0,
      unlearned: totalCards > 0 ? Math.round((unlearnedCount / totalCards) * 100) : 0,
    };
    const progressHistory = await prisma.studyHistory.findMany({
      where: { deckId: params.deckId },
      orderBy: { createdAt: 'desc' },
      take: 30,
      select: { progress: true, createdAt: true },
    });
    return NextResponse.json({ ...deck, stats, progressHistory });
  } catch (e) {
    return NextResponse.json({ error: 'DB取得エラー', detail: String(e) }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { deckId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const deck = await prisma.deck.findUnique({
      where: {
        id: params.deckId,
        userId: session.user.id,
      },
    });

    if (!deck) {
      return new NextResponse("Deck not found", { status: 404 });
    }

    await prisma.deck.delete({
      where: {
        id: params.deckId,
      },
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("[DECK_DELETE]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}