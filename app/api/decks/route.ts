import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";

const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const data = await req.json();
  const { title, description, groupIds, newGroups, cardCount, progress, lastStudied, cards } = data;

  try {
    // 新しいグループを作成
    const createdGroups = await Promise.all(
      (newGroups || []).map(async (group: { name: string; description?: string }) => {
        if (!session.user?.id) throw new Error("User ID is required");
        return prisma.group.create({
          data: {
            name: group.name,
            description: group.description || null,
            userId: session.user.id,
          },
        });
      })
    );

    // 既存のグループIDと新しく作成したグループのIDを結合
    const allGroupIds = [
      ...(groupIds || []),
      ...createdGroups.map(group => group.id)
    ];

    const newDeck = await prisma.deck.create({
      data: {
        title,
        description,
        cardCount,
        progress,
        lastStudied: lastStudied ? new Date(lastStudied) : null,
        userId: session.user.id,
        groups: {
          connect: allGroupIds.map((id: string) => ({ id }))
        },
        cards: {
          create: (cards || []).map((c: { front: string; back: string }) => ({ front: c.front, back: c.back }))
        }
      },
      include: { 
        groups: true, 
        cards: true 
      }
    });

    return NextResponse.json({
      deck: newDeck,
      createdGroups: createdGroups
    });
  } catch (e) {
    console.error("Error creating deck:", e);
    return NextResponse.json({ error: 'DB保存エラー', detail: String(e) }, { status: 500 });
  }
} 

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return new NextResponse("Unauthorized", { status: 401 });
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
        lastStudied: "desc",
      },
    });

    return NextResponse.json(decks);
  } catch (error) {
    console.error("Error fetching decks:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
