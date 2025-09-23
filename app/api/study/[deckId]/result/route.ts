import { NextRequest, NextResponse } from 'next/server';
import { container } from '@/src/infrastructure/container/di-container';
import { z } from 'zod';

const updateStudyResultSchema = z.object({
  results: z.array(
    z.object({
      id: z.string(),
      mastered: z.boolean(),
    }),
  ),
});

export async function POST(
  req: NextRequest,
  { params }: { params: { deckId: string } },
) {
  try {
    const body = await req.json();
    const validatedData = updateStudyResultSchema.parse(body);

    const updateStudyResultUseCase = container.getUpdateStudyResultUseCase();
    const result = await updateStudyResultUseCase.execute({
      deckId: params.deckId,
      results: validatedData.results,
    });

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating study result:', error);
    return NextResponse.json(
      { error: '学習結果の更新に失敗しました', detail: String(error) },
      { status: 500 },
    );
  }
}
