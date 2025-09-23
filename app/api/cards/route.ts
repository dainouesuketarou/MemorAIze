import { NextRequest, NextResponse } from 'next/server';
import { container } from '@/src/infrastructure/container/di-container';

export async function POST(req: NextRequest) {
  try {
    const { deckId, front, back } = await req.json();
    if (!deckId || !front || !back) {
      return NextResponse.json(
        { error: 'deckId, front, backは必須です' },
        { status: 400 },
      );
    }

    // ユースケースを実行
    const addCardUseCase = container.getAddCardUseCase();
    const result = await addCardUseCase.execute({
      deckId,
      front,
      back,
    });

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 500 });
    }

    return NextResponse.json(result.card);
  } catch (e) {
    return NextResponse.json(
      { error: 'カード追加エラー', detail: String(e) },
      { status: 500 },
    );
  }
}
