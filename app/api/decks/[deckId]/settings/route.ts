import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';
import { FilterMode, Prisma } from '@prisma/client';

type Body = {
  autoSpeak?: boolean;
  reverse?: boolean;
  shuffle?: boolean;
  /** 文字列が飛んで来るので string[] で受け取り → FilterMode[] に変換 */
  filterMode?: string[];
  reset?: boolean;
};

export async function GET(
  _req: NextRequest,
  { params }: { params: { deckId: string } },
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id)
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const setting = await prisma.deckSetting.findUnique({
    where: {
      userId_deckId: { userId: session.user.id, deckId: params.deckId },
    },
  });
  return NextResponse.json({ data: setting });
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { deckId: string } },
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id)
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const userId = session.user.id;
  const deckId = params.deckId;

  /*──── 本文整形 ────*/
  const body: Body = await req.json();

  /** reset フラグはここで解釈して削除 */
  if (body.reset) {
    // 例: progress を 0 に戻す SQL など
    delete body.reset;
  }

  /** filterMode―――文字列 → enum 配列へ変換 / 空なら undefined へ */
  let modes: FilterMode[] | undefined;
  if (Array.isArray(body.filterMode)) {
    const allow = new Set(Object.values(FilterMode));
    const arr = body.filterMode.filter<FilterMode>((v): v is FilterMode =>
      allow.has(v as FilterMode),
    );
    if (arr.length) modes = arr;
  }

  /*──── Prisma に渡す型を個別に構築 ────*/
  const updateData: Prisma.DeckSettingUncheckedUpdateInput = {
    autoSpeak: body.autoSpeak,
    reverse: body.reverse,
    shuffle: body.shuffle,
    ...(modes ? { filterMode: modes } : {}),
  };

  const createData: Prisma.DeckSettingUncheckedCreateInput = {
    userId,
    deckId,
    autoSpeak: body.autoSpeak ?? false,
    reverse: body.reverse ?? false,
    shuffle: body.shuffle ?? false,
    filterMode: modes ?? [], // ← create は空配列で OK
  };

  /*──── upsert ────*/
  const saved = await prisma.deckSetting.upsert({
    where: { userId_deckId: { userId, deckId } },
    update: updateData,
    create: createData,
  });

  return NextResponse.json({ data: saved });
}
