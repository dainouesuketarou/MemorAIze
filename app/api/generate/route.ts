import { NextResponse } from 'next/server';
import { z } from 'zod';
import OpenAI from 'openai';
import { PrismaClient } from '@prisma/client';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

const prisma = new PrismaClient();
const MONTHLY_LIMIT = 5;
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const generateSchema = z
  .object({
    title: z.string().optional(),
    content: z.string().optional(),
    file: z.string().optional(),
    cardFormat: z.enum(['term-meaning', 'question-answer', 'custom', 'auto']),
    cardCount: z.number().min(1).max(100),
    additionalInstructions: z.string().optional(),
  })
  .refine(
    (data) =>
      Boolean(data.title && data.title.trim().length >= 2) ||
      Boolean(data.content && data.content.trim().length > 0) ||
      Boolean(data.file && data.file.trim().length > 0),
    {
      message:
        'タイトル、学習内容、またはファイルURLのいずれかを指定してください。',
      path: [''],
    },
  );

function buildCardPrompt(data: z.infer<typeof generateSchema>) {
  const instrs = {
    'term-meaning': '表に単語や用語、裏にその意味や説明を記載してください。',
    'question-answer': '表に問題、裏にその答えを記載してください。',
    custom:
      data.additionalInstructions || '表裏の内容を自由に設定してください。',
    auto: '内容に応じて最適な形式（単語/意味 または 問題/答え）を選択してください。',
  };

  let p = `暗記カードを${data.cardCount}枚作成してください。\n`;
  if (data.title) p += `タイトル: ${data.title}\n`;
  if (data.content) p += `学習内容: ${data.content}\n`;
  if (data.file) p += `参照ファイルURL: ${data.file}\n`;
  p += `カード形式: ${instrs[data.cardFormat]}\n\n`;
  p += `出力はJSON配列で、各要素が{"front": "...","back":"..."} の形で返してください。\n`;
  p += `例：
[
 {"front":"用語","back":"意味"},
 …
]\n`;
  return p;
}

export async function POST(req: Request) {
  try {
    // 認証・上限チェック
    const session = await getServerSession(authOptions);
    if (!session?.user?.id)
      return NextResponse.json(
        { success: false, error: '認証が必要です' },
        { status: 401 },
      );

    const now = new Date();
    const utc = now.getTime() + now.getTimezoneOffset() * 60000;
    const jst = new Date(utc + 9 * 3600 * 1000);
    const startOfMonth = new Date(jst.getFullYear(), jst.getMonth(), 1);

    const genLimit = await prisma.aiGenerationLimit.upsert({
      where: { userId_month: { userId: session.user.id, month: startOfMonth } },
      update: {},
      create: { userId: session.user.id, month: startOfMonth, count: 0 },
    });
    if (genLimit.count >= MONTHLY_LIMIT) {
      return NextResponse.json(
        { success: false, error: '今月のAI生成回数の上限に達しました。' },
        { status: 429 },
      );
    }

    // バリデーション
    const body = await req.json();
    const data = generateSchema.parse(body);

    // 1) カード生成
    const cardCompletion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: 'あなたは優秀な教育用AIです。' },
        { role: 'user', content: buildCardPrompt(data) },
      ],
      temperature: 0.7,
      max_tokens: 4096,
    });
    const raw = cardCompletion.choices[0].message.content || '';
    const match = raw.match(/\[[\s\S]*\]/);
    if (!match) throw new Error('カードのJSONが見つかりません');
    const cards: { front: string; back: string }[] = JSON.parse(match[0]);

    // カウント更新（カード生成分）
    await prisma.aiGenerationLimit.update({
      where: { id: genLimit.id },
      data: { count: { increment: 1 } },
    });

    // 2) タイトル未指定ならAIに作成させる
    let title = data.title ?? '';
    if (!title) {
      const titlePrompt = `
以下の暗記カードセットに対し、1～15文字以内の日本語タイトルを１つだけ提案してください。返答はタイトルのみとしてください。\n
${JSON.stringify(cards, null, 2)}
`;
      const titleCompletion = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: 'あなたはタイトル作成に特化したAIです。' },
          { role: 'user', content: titlePrompt },
        ],
        temperature: 0.5,
        max_tokens: 20,
      });
      const t = titleCompletion.choices[0].message.content?.trim() || '';
      title = t.slice(0, 15); // 一応切り詰め
    }

    return NextResponse.json({
      success: true,
      data: {
        title,
        cards: cards.map((c, i) => ({
          id: `card-${i + 1}`,
          front: c.front,
          back: c.back,
        })),
      },
    });
  } catch (e: any) {
    console.error('generate API error:', e);
    if (e?.issues) {
      return NextResponse.json(
        {
          success: false,
          error: '入力エラー',
          details: e.issues.map((i: any) => ({
            field: i.path.join('.'),
            message: i.message,
          })),
        },
        { status: 400 },
      );
    }
    return NextResponse.json(
      { success: false, error: e.message || 'サーバーエラー' },
      { status: 500 },
    );
  }
}
