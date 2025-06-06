import { NextRequest, NextResponse } from 'next/server';
import { prisma, withPrisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: '認証が必要です' }, { status: 401 });
    }

    const groups = await withPrisma(async (prisma) => {
      return await prisma.group.findMany({
        where: {
          userId: session.user.id,
        },
      });
    });
    return NextResponse.json(groups);
  } catch (e) {
    return NextResponse.json(
      { error: 'DB取得エラー', detail: String(e) },
      { status: 500 },
    );
  }
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: '認証が必要です' }, { status: 401 });
  }

  const data = await req.json();
  const { name } = data;
  if (!name) {
    return NextResponse.json(
      { error: 'グループ名は必須です' },
      { status: 400 },
    );
  }
  try {
    const newGroup = await withPrisma(async (prisma) => {
      return await prisma.group.create({
        data: {
          name,
          userId: session.user.id,
        },
      });
    });
    return NextResponse.json(newGroup);
  } catch (e) {
    return NextResponse.json(
      { error: 'DB保存エラー', detail: String(e) },
      { status: 500 },
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

    // グループの所有者を確認
    const group = await withPrisma(async (prisma) => {
      return await prisma.group.findUnique({
        where: { id: groupId },
      });
    });

    if (!group) {
      return NextResponse.json(
        { error: 'グループが見つかりません' },
        { status: 404 },
      );
    }

    if (group.userId !== session.user.id) {
      return NextResponse.json(
        { error: 'このグループを削除する権限がありません' },
        { status: 403 },
      );
    }

    // グループを削除
    await withPrisma(async (prisma) => {
      await prisma.group.delete({
        where: { id: groupId },
      });
    });

    return NextResponse.json({ success: true });
  } catch (e) {
    return NextResponse.json(
      { error: 'DB削除エラー', detail: String(e) },
      { status: 500 },
    );
  }
}
