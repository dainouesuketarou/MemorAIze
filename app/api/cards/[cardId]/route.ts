import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function DELETE(
  req: NextRequest,
  { params }: { params: { cardId: string } }
) {
  try {
    const { cardId } = params;

    // カードの存在確認
    const card = await prisma.card.findUnique({
      where: { id: cardId }
    });

    if (!card) {
      return NextResponse.json(
        { error: 'カードが見つかりません' },
        { status: 404 }
      );
    }

    // カードの削除
    await prisma.card.delete({
      where: { id: cardId }
    });

    return NextResponse.json({ success: true });
  } catch (e) {
    console.error('[CARD_DELETE]', e);
    return NextResponse.json(
      { error: 'カード削除エラー', detail: String(e) },
      { status: 500 }
    );
  }
}