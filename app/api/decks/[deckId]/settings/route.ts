import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { container } from '@/src/infrastructure/container/di-container';
import { z } from 'zod';

const updateDeckSettingSchema = z.object({
  autoSpeak: z.boolean().optional(),
  reverse: z.boolean().optional(),
  shuffle: z.boolean().optional(),
  filterMode: z.array(z.string()).optional(),
  reset: z.boolean().optional(),
});

export async function GET(
  _req: NextRequest,
  { params }: { params: { deckId: string } },
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: '認証が必要です' }, { status: 401 });
    }

    const getDeckSettingUseCase = container.getGetDeckSettingUseCase();
    const result = await getDeckSettingUseCase.execute({
      userId: session.user.id,
      deckId: params.deckId,
    });

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({ data: result.deckSetting });
  } catch (error) {
    console.error('Error fetching deck setting:', error);
    return NextResponse.json(
      { error: 'デッキ設定の取得に失敗しました' },
      { status: 500 },
    );
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { deckId: string } },
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: '認証が必要です' }, { status: 401 });
    }

    const body = await req.json();
    const validatedData = updateDeckSettingSchema.parse(body);

    const updateDeckSettingUseCase = container.getUpdateDeckSettingUseCase();
    const result = await updateDeckSettingUseCase.execute({
      userId: session.user.id,
      deckId: params.deckId,
      autoSpeak: validatedData.autoSpeak,
      reverse: validatedData.reverse,
      shuffle: validatedData.shuffle,
      filterMode: validatedData.filterMode as any, // Type assertion for compatibility
    });

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({ data: result.deckSetting });
  } catch (error) {
    console.error('Error updating deck setting:', error);
    return NextResponse.json(
      { error: 'デッキ設定の更新に失敗しました' },
      { status: 500 },
    );
  }
}
