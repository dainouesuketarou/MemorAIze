import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  try {
    const groups = await prisma.group.findMany();
    return NextResponse.json(groups);
  } catch (e) {
    return NextResponse.json({ error: 'DB取得エラー', detail: String(e) }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const data = await req.json();
  const { name } = data;
  if (!name) {
    return NextResponse.json({ error: 'グループ名は必須です' }, { status: 400 });
  }
  try {
    const newGroup = await prisma.group.create({
      data: { name }
    });
    return NextResponse.json(newGroup);
  } catch (e) {
    return NextResponse.json({ error: 'DB保存エラー', detail: String(e) }, { status: 500 });
  }
}