import { NextResponse } from 'next/server';
import { z } from 'zod';
import OpenAI from 'openai';
import { GoogleGenAI } from '@google/genai';
import { PrismaClient, AiGenerationLimit } from '@prisma/client';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

const prisma = new PrismaClient();
const FREE_PLAN_MONTHLY_LIMIT = 5;
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const googleAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const generateSchema = z
  .object({
    title: z.string().optional(),
    content: z.string().optional(),
    file: z.string().optional(),
    cardFormat: z.enum(['term-meaning', 'question-answer', 'custom', 'auto']),
    cardAmount: z.enum(['few', 'normal', 'many']),
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

function getCardCountRange(amount: 'few' | 'normal' | 'many'): {
  min: number;
  max: number;
} {
  switch (amount) {
    case 'few':
      return { min: 1, max: 5 };
    case 'normal':
      return { min: 1, max: 20 };
    case 'many':
      return { min: 1, max: 30 };
  }
}

function buildCardPrompt(data: z.infer<typeof generateSchema>) {
  const { min, max } = getCardCountRange(data.cardAmount);
  const instrs = {
    'term-meaning': '表に単語や用語、裏にその意味や説明を記載してください。',
    'question-answer': '表に問題、裏にその答えを記載してください。',
    custom:
      data.additionalInstructions || '表裏の内容を自由に設定してください。',
    auto: '内容に応じて最適な形式（単語/意味 または 問題/答え）を選択してください。',
  };

  let p = `暗記カードを${min}～${max}枚の範囲で、内容に応じて適切な枚数を作成してください。\n`;
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

  p += `\n注意事項：
- 内容は簡潔で分かりやすく作成してください
- 学習効果が高くなるように工夫してください
- 必ず上記のJSON形式で配列として出力してください
- 余分な説明やテキストは含めないでください
- カードは表や裏面が必ず、問題と答えのペアである必要があります
- 画像やPDFファイルから問題を生成する場合、指定された問題数より少ない問題しか作成できない場合は、*作成可能な問題数までで生成を終了してください*
- 各カードの内容は、元の資料の内容を正確に反映させてください
- 不適切な内容や著作権に違反する内容は避けてください`;

  return p;
}

// Google AI APIを使用したカード生成関数
async function generateCardsWithGoogleAI(data: z.infer<typeof generateSchema>) {
  const prompt = buildCardPrompt(data);
  console.log('Gooo!!');

  try {
    const result = await googleAI.models.generateContent({
      model: 'gemini-2.5-flash-preview-05-20',
      contents: [prompt],
    });
    const text = result.text;

    // JSONの抽出とパース
    const match = text!.match(/\[[\s\S]*\]/);
    if (!match) throw new Error('カードのJSONが見つかりません');
    const cards: { front: string; back: string }[] = JSON.parse(match[0]);

    return cards;
  } catch (error) {
    console.error('Google AI API Error:', error);
    throw new Error('Google AIによるカード生成に失敗しました');
  }
}

// タイトル生成用のGoogle AI関数
async function generateTitleWithGoogleAI(
  cards: { front: string; back: string }[],
) {
  try {
    const model = 'gemini-2.5-flash-preview-05-20';
    const prompt = `
以下の暗記カードセットに対し、1～15文字以内の日本語タイトルを１つだけ提案してください。返答はタイトルのみとしてください。\n
${JSON.stringify(cards, null, 2)}
`;
    const response = await googleAI.models.generateContent({
      model,
      contents: [prompt],
    });
    const title = response.text!.trim().slice(0, 15); // 一応切り詰め
    return title;
  } catch (error) {
    console.error('Google AI Title Generation Error:', error);
    throw new Error('タイトルの生成に失敗しました');
  }
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

    // ユーザーのサブスクリプション情報を取得
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: { subscription: true },
    });

    const isProUser =
      user?.subscription?.plan === 'PRO_MONTHLY' ||
      user?.subscription?.plan === 'PRO_YEARLY';
    let genLimit: AiGenerationLimit | undefined;

    // Freeプランの場合のみ制限をチェック
    if (!isProUser) {
      const now = new Date();
      const utc = now.getTime() + now.getTimezoneOffset() * 60000;
      const jst = new Date(utc + 9 * 3600 * 1000);
      const startOfMonth = new Date(jst.getFullYear(), jst.getMonth(), 1);

      genLimit = await prisma.aiGenerationLimit.upsert({
        where: {
          userId_month: { userId: session.user.id, month: startOfMonth },
        },
        update: {},
        create: { userId: session.user.id, month: startOfMonth, count: 0 },
      });

      if (genLimit.count >= FREE_PLAN_MONTHLY_LIMIT) {
        return NextResponse.json(
          {
            success: false,
            error: '今月のAI生成回数の上限に達しました。',
            limit: FREE_PLAN_MONTHLY_LIMIT,
            currentCount: genLimit.count,
            isProUser: false,
          },
          { status: 429 },
        );
      }
    }

    // バリデーション
    const body = await req.json();
    const data = generateSchema.parse(body);

    // AIモデルの選択（環境変数で切り替え可能）
    const useGoogleAI = process.env.USE_GOOGLE_AI === 'true';
    let cards: { front: string; back: string }[];
    let title = data.title ?? '';

    try {
      // カード生成
      if (useGoogleAI) {
        cards = await generateCardsWithGoogleAI(data);
      } else {
        const cardCompletion = await openai.chat.completions.create({
          model: 'gpt-4.1-nano',
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
        cards = JSON.parse(match[0]);
      }

      // タイトル生成
      if (!title) {
        if (useGoogleAI) {
          title = await generateTitleWithGoogleAI(cards);
        } else {
          const titlePrompt = `
以下の暗記カードセットに対し、1～15文字以内の日本語タイトルを１つだけ提案してください。返答はタイトルのみとしてください。\n
${JSON.stringify(cards, null, 2)}
`;
          const titleCompletion = await openai.chat.completions.create({
            model: 'gpt-4o-mini',
            messages: [
              {
                role: 'system',
                content: 'あなたはタイトル作成に特化したAIです。',
              },
              { role: 'user', content: titlePrompt },
            ],
            temperature: 0.5,
            max_tokens: 20,
          });
          const t = titleCompletion.choices[0].message.content?.trim() || '';
          title = t.slice(0, 15); // 一応切り詰め
        }
      }

      // カウント更新（Freeプランの場合のみ）
      if (!isProUser && genLimit) {
        const updatedLimit = await prisma.aiGenerationLimit.update({
          where: { id: genLimit.id },
          data: { count: { increment: 1 } },
        });

        // Reduxの状態を更新するためのレスポンスヘッダーを追加
        const headers = new Headers();
        headers.append(
          'X-Update-AI-Limit',
          JSON.stringify({
            dailyUsage: updatedLimit.count,
            dailyLimit: FREE_PLAN_MONTHLY_LIMIT,
            monthlyUsage: updatedLimit.count,
            monthlyLimit: FREE_PLAN_MONTHLY_LIMIT,
          }),
        );

        return NextResponse.json(
          {
            success: true,
            data: {
              title,
              cards: cards.map((c, i) => ({
                id: `card-${i + 1}`,
                front: c.front,
                back: c.back,
              })),
            },
          },
          { headers },
        );
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
    } catch (error: any) {
      console.error('AI Generation Error:', error);
      throw error;
    }
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
