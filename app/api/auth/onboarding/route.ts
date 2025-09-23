import { NextResponse } from 'next/server';
import { getAuthSession } from '@/src/lib/auth';
import { container } from '@/src/infrastructure/container/di-container';

export async function POST(request: Request) {
  try {
    const session = await getAuthSession();
    if (!session?.user?.email || !session?.user?.id) {
      return NextResponse.json({ error: '認証が必要です' }, { status: 401 });
    }

    const { username, purposes } = await request.json();

    // ユースケースを実行
    const completeOnboardingUseCase = container.getCompleteOnboardingUseCase();
    const result = await completeOnboardingUseCase.execute({
      userId: session.user.id,
      username,
      purposes,
    });

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 500 });
    }

    return NextResponse.json(result.user);
  } catch (error) {
    console.error('オンボーディングの保存に失敗しました:', error);
    return NextResponse.json(
      { error: 'オンボーディングの保存に失敗しました' },
      { status: 500 },
    );
  }
}
