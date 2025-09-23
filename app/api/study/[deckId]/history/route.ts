import { NextRequest, NextResponse } from 'next/server';
import { container } from '@/src/infrastructure/container/di-container';

export async function POST(
  req: NextRequest,
  { params }: { params: { deckId: string } },
) {
  try {
    const createStudyHistoryUseCase = container.getCreateStudyHistoryUseCase();
    const result = await createStudyHistoryUseCase.execute({
      deckId: params.deckId,
    });

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      data: result.studyHistory,
    });
  } catch (error) {
    console.error('Error creating study history:', error);
    return NextResponse.json(
      { error: '学習履歴の記録に失敗しました', detail: String(error) },
      { status: 500 },
    );
  }
}
