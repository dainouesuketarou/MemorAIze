import { NextResponse } from 'next/server';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { getServerSession } from 'next-auth';
import { container } from '@/src/infrastructure/container/di-container';
import {
  AddDeckToGroupRequestSchema,
  AddDeckToGroupResponse,
  SuccessResponse,
  ErrorResponse,
} from '@/src/dto';

export async function POST(
  req: Request,
  { params }: { params: { deckId: string } },
): Promise<NextResponse<AddDeckToGroupResponse>> {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        {
          success: false,
          error: '認証が必要です',
        } as AddDeckToGroupResponse,
        { status: 401 },
      );
    }

    const body = await req.json();
    const validatedData = AddDeckToGroupRequestSchema.parse(body);

    // まずグループを作成または取得
    const createGroupUseCase = container.getCreateGroupUseCase();
    const groupResult = await createGroupUseCase.execute({
      userId: session.user.id,
      name: validatedData.groupName,
    });

    if (!groupResult.success || !groupResult.group) {
      return NextResponse.json(
        {
          success: false,
          error: groupResult.error || 'グループの作成に失敗しました',
        } as AddDeckToGroupResponse,
        { status: 500 },
      );
    }

    // デッキのグループを更新
    const updateDeckGroupsUseCase = container.getUpdateDeckGroupsUseCase();
    const updateResult = await updateDeckGroupsUseCase.execute({
      deckId: params.deckId,
      userId: session.user.id,
      groupIds: [groupResult.group.id],
    });

    if (!updateResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: updateResult.error || 'デッキのグループ更新に失敗しました',
        } as AddDeckToGroupResponse,
        { status: 500 },
      );
    }

    const response: SuccessResponse<{
      groupId: string;
      deckId: string;
    }> = {
      success: true,
      data: {
        groupId: groupResult.group.id,
        deckId: params.deckId,
      },
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('[DECK_GROUP]', error);
    const errorResponse: ErrorResponse = {
      success: false,
      error: 'デッキのグループ追加に失敗しました',
      details: error instanceof Error ? error.message : String(error),
      timestamp: new Date().toISOString(),
    };
    return NextResponse.json(errorResponse, { status: 500 });
  }
}
