import { NextRequest, NextResponse } from 'next/server';
import { container } from '@/src/infrastructure/container/di-container';
import { z } from 'zod';

const deleteCardSchema = z.object({
  deckId: z.string().min(1, 'デッキIDは必須です'),
});

export async function DELETE(
  req: NextRequest,
  { params }: { params: { cardId: string } },
) {
  try {
    const body = await req.json();
    const validatedData = deleteCardSchema.parse(body);

    const deleteCardUseCase = container.getDeleteCardUseCase();
    const result = await deleteCardUseCase.execute({
      cardId: params.cardId,
      deckId: validatedData.deckId,
    });

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[CARD_DELETE]', error);
    return NextResponse.json(
      { error: 'カード削除エラー', detail: String(error) },
      { status: 500 },
    );
  }
}
