import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { container } from '@/src/infrastructure/container/di-container';
import { GetOnboardingStatusResponse, SuccessResponse } from '@/src/dto';

// 動的レンダリングを明示的に指定
export const dynamic = 'force-dynamic';

export async function GET(): Promise<
  NextResponse<GetOnboardingStatusResponse>
> {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        {
          success: false,
          error: '認証が必要です',
        } as GetOnboardingStatusResponse,
        { status: 401 },
      );
    }

    const getOnboardingStatusUseCase =
      container.getGetOnboardingStatusUseCase();
    const result = await getOnboardingStatusUseCase.execute({
      userId: session.user.id,
    });

    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          error: result.error || 'オンボーディング状況の取得に失敗しました',
        } as GetOnboardingStatusResponse,
        { status: 500 },
      );
    }

    const response: SuccessResponse<{ isOnboarded: boolean }> = {
      success: true,
      data: { isOnboarded: result.isOnboarded ?? false },
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error fetching onboarding status:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'オンボーディング状況の取得に失敗しました',
      } as GetOnboardingStatusResponse,
      { status: 500 },
    );
  }
}
