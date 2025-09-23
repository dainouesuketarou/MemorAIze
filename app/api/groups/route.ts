import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { container } from '@/src/infrastructure/container/di-container';
import { z } from 'zod';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: '認証が必要です' }, { status: 401 });
    }

    const getUserGroupsUseCase = container.getGetUserGroupsUseCase();
    const result = await getUserGroupsUseCase.execute({
      userId: session.user.id,
    });

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 500 });
    }

    return NextResponse.json(result.groups);
  } catch (error) {
    console.error('Error fetching groups:', error);
    return NextResponse.json(
      {
        error: 'グループの取得に失敗しました',
        details:
          error instanceof Error ? error.message : '不明なエラーが発生しました',
      },
      { status: 500 },
    );
  }
}

const createGroupSchema = z.object({
  name: z.string().min(1, 'グループ名は必須です'),
  description: z.string().optional(),
  deckIds: z.array(z.string()).optional(),
});

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: '認証が必要です' }, { status: 401 });
    }

    const body = await req.json();
    const validatedData = createGroupSchema.parse(body);

    const createGroupUseCase = container.getCreateGroupUseCase();
    const result = await createGroupUseCase.execute({
      userId: session.user.id,
      name: validatedData.name,
      description: validatedData.description,
      deckIds: validatedData.deckIds,
    });

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      data: result.group,
    });
  } catch (error) {
    console.error('Error creating group:', error);
    return NextResponse.json(
      {
        error: 'グループの作成に失敗しました',
        details:
          error instanceof Error ? error.message : '不明なエラーが発生しました',
      },
      { status: 400 },
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: '認証が必要です' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const groupId = searchParams.get('id');
    if (!groupId) {
      return NextResponse.json(
        { error: 'グループIDは必須です' },
        { status: 400 },
      );
    }

    const deleteGroupUseCase = container.getDeleteGroupUseCase();
    const result = await deleteGroupUseCase.execute({
      groupId,
      userId: session.user.id,
    });

    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: result.error === 'グループが見つかりません' ? 404 : 403 },
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting group:', error);
    return NextResponse.json(
      {
        error: 'グループの削除に失敗しました',
        details:
          error instanceof Error ? error.message : '不明なエラーが発生しました',
      },
      { status: 500 },
    );
  }
}
