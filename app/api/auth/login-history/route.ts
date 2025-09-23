import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { container } from '@/src/infrastructure/container/di-container';
import {
  CreateLoginHistoryRequestSchema,
  CreateLoginHistoryResponse,
  GetLoginHistoryQuerySchema,
  GetLoginHistoryResponse,
  SuccessResponse,
  ErrorResponse,
} from '@/src/dto';

// ログイン履歴を記録
export async function POST(
  req: Request,
): Promise<NextResponse<CreateLoginHistoryResponse>> {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        {
          success: false,
          error: '認証が必要です',
        } as CreateLoginHistoryResponse,
        { status: 401 },
      );
    }

    const body = await req.json();
    const validatedData = CreateLoginHistoryRequestSchema.parse(body);

    const createLoginHistoryUseCase = container.getCreateLoginHistoryUseCase();
    const result = await createLoginHistoryUseCase.execute({
      userId: session.user.id,
      loginAt: validatedData.loginAt
        ? new Date(validatedData.loginAt)
        : new Date(),
    });

    if (!result.success || !result.loginHistory) {
      return NextResponse.json(
        {
          success: false,
          error: result.error || 'ログイン履歴の作成に失敗しました',
        } as CreateLoginHistoryResponse,
        { status: 400 },
      );
    }

    const response: SuccessResponse<{
      id: string;
      userId: string;
      loginAt: string;
      createdAt: string;
    }> = {
      success: true,
      data: {
        id: result.loginHistory.id,
        userId: result.loginHistory.userId,
        loginAt: result.loginHistory.loginAt.toISOString(),
        createdAt: result.loginHistory.createdAt.toISOString(),
      },
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('ログイン履歴の記録に失敗しました:', error);
    const errorResponse: ErrorResponse = {
      success: false,
      error: 'ログイン履歴の記録に失敗しました',
      details: error instanceof Error ? error.message : String(error),
      timestamp: new Date().toISOString(),
    };
    return NextResponse.json(errorResponse, { status: 500 });
  }
}

// 特定の期間のログイン履歴を取得
export async function GET(
  req: Request,
): Promise<NextResponse<GetLoginHistoryResponse>> {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        {
          success: false,
          error: '認証が必要です',
        } as GetLoginHistoryResponse,
        { status: 401 },
      );
    }

    const { searchParams } = new URL(req.url);
    const queryParams = Object.fromEntries(searchParams.entries());
    const validatedQuery = GetLoginHistoryQuerySchema.parse(queryParams);

    const getUserLoginHistoryUseCase =
      container.getGetUserLoginHistoryUseCase();
    const result = await getUserLoginHistoryUseCase.execute({
      userId: session.user.id,
      startDate: validatedQuery.startDate
        ? new Date(validatedQuery.startDate)
        : undefined,
      endDate: validatedQuery.endDate
        ? new Date(validatedQuery.endDate)
        : undefined,
      limit: validatedQuery.limit,
    });

    if (!result.success || !result.loginHistories) {
      return NextResponse.json(
        {
          success: false,
          error: result.error || 'ログイン履歴の取得に失敗しました',
        } as GetLoginHistoryResponse,
        { status: 400 },
      );
    }

    const response: SuccessResponse<
      Array<{
        id: string;
        userId: string;
        loginAt: string;
        createdAt: string;
      }>
    > = {
      success: true,
      data: result.loginHistories.map((history) => ({
        id: history.id,
        userId: history.userId,
        loginAt: history.loginAt.toISOString(),
        createdAt: history.createdAt.toISOString(),
      })),
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('ログイン履歴の取得に失敗しました:', error);
    const errorResponse: ErrorResponse = {
      success: false,
      error: 'ログイン履歴の取得に失敗しました',
      details: error instanceof Error ? error.message : String(error),
      timestamp: new Date().toISOString(),
    };
    return NextResponse.json(errorResponse, { status: 500 });
  }
}
