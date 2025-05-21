import { NextResponse } from 'next/server';
import { z } from 'zod';
import OpenAI from 'openai';
import { GoogleGenAI } from '@google/genai';
import { PrismaClient } from '@prisma/client';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { nanoid } from 'nanoid';

const prisma = new PrismaClient();
const MONTHLY_LIMIT = 5;

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const googleAI = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

const addCardsSchema = z.object({
  deckId: z.string(),
  content: z.string().optional(),
  cardFormat: z.enum(['term-meaning', 'question-answer', 'auto']),
  cardAmount: z.enum(['few', 'normal', 'many']),
  additionalInstructions: z.string().optional(),
});

function getCardCountRange(amount: 'few' | 'normal' | 'many'): {
  min: number;
  max: number;
} {
  switch (amount) {
    case 'few':
      return { min: 1, max: 5 };
    case 'normal':
      return { min: 5, max: 20 };
    case 'many':
      return { min: 20, max: 30 };
  }
}

function generatePrompt(data: z.infer<typeof addCardsSchema>) {
  const { min, max } = getCardCountRange(data.cardAmount);
  const formatInstructions = {
    'term-meaning': '表に単語や用語、裏にその意味や説明を記載してください。',
    'question-answer': '表に問題、裏にその答えを記載してください。',
    auto: '用語や単語の意味を問うタイプの問題を生成するときは、表に単語や用語、裏にその意味や説明を記載してください。それ以外は、表に問題、裏にその答えを記載してください。',
  };

  return `
以下の内容で暗記カードを${min}～${max}枚の範囲で、内容に応じて適切な枚数を作成してください。

${data.content ? `学習内容: ${data.content}` : ''}
カード形式: ${formatInstructions[data.cardFormat]}

以下のJSON形式で配列として出力してください：
[
  {
    "front": "カードの表の内容",
    "back": "カードの裏の内容"
  }
]

${data.additionalInstructions ? `追加指示: ${data.additionalInstructions}` : ''}

注意事項：
- 内容は簡潔で分かりやすく作成してください
- 学習効果が高くなるように工夫してください
- 必ず上記のJSON形式で配列として出力してください
- 余分な説明やテキストは含めないでください
- カードは表や裏面が必ず、問題と答えのペアである必要があります
- 画像やPDFファイルから問題を生成する場合、指定された問題数より少ない問題しか作成できない場合は、作成可能な問題数までで生成を終了してください
- 各カードの内容は、元の資料の内容を正確に反映させてください
- 不適切な内容や著作権に違反する内容は避けてください
- 生成されたカードは、既存のカードと重複しないようにしてください
`;
}

// Google AI APIを使用したカード生成関数
async function generateCardsWithGoogleAI(data: z.infer<typeof addCardsSchema>) {
  const prompt = generatePrompt(data);

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

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: '認証が必要です' },
        { status: 401 },
      );
    }

    // 月間生成回数をチェック
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const generationLimit = await prisma.aiGenerationLimit.upsert({
      where: {
        userId_month: {
          userId: session.user.id,
          month: startOfMonth,
        },
      },
      update: {},
      create: {
        userId: session.user.id,
        month: startOfMonth,
        count: 0,
      },
    });

    if (generationLimit.count >= MONTHLY_LIMIT) {
      return NextResponse.json(
        {
          success: false,
          error: '今月のAI生成回数の上限に達しました。来月までお待ちください。',
        },
        { status: 429 },
      );
    }

    const body = await req.json();
    const validatedData = addCardsSchema.parse(body);

    const prompt = generatePrompt(validatedData);
    let cards: { front: string; back: string; id?: string }[];

    try {
      // AIモデルの選択（環境変数で切り替え可能）
      const useGoogleAI = process.env.USE_GOOGLE_AI === 'true';

      if (useGoogleAI) {
        cards = await generateCardsWithGoogleAI(validatedData);
        cards = cards.map((card) => ({
          ...card,
          id: nanoid(),
        }));
      } else {
        const completion = await openai.chat.completions.create({
          model: 'gpt-4.1-nano',
          messages: [
            {
              role: 'system',
              content:
                'あなたは教育の専門家で、効果的な暗記カードを作成するエキスパートです。',
            },
            {
              role: 'user',
              content: prompt,
            },
          ],
          temperature: 0.7,
          max_tokens: 4096,
        });

        const response = completion.choices[0].message.content;
        const jsonMatch = response?.match(/\[[\s\S]*\]/);
        if (jsonMatch) {
          cards = JSON.parse(jsonMatch[0]);
        } else {
          throw new Error('Invalid response format');
        }
      }

      const result = await prisma.$transaction(async (tx) => {
        // const savedCards = [];

        // for (const card of cards) {
        //   // カード作成
        //   const savedCard = await tx.card.create({
        //     data: {
        //       deckId: validatedData.deckId,
        //       front: card.front,
        //       back: card.back,
        //       status: 'UNLEARNED',
        //       order: 0,
        //     },
        //   });
        //   savedCards.push(savedCard);
        // }

        // // StudyHistory作成
        // await tx.studyHistory.create({
        //   data: {
        //     deckId: validatedData.deckId,
        //     progress: 0,
        //   },
        // });

        // // Deckの進捗度更新
        // const deck = await tx.deck.findUnique({
        //   where: { id: validatedData.deckId },
        //   include: {
        //     cards: true,
        //   },
        // });

        // if (deck) {
        //   const totalCards = deck.cards.length;
        //   const masteredCount = deck.cards.filter(card => card.status === 'MASTERED').length;
        //   const progress = totalCards > 0 ? masteredCount / totalCards : 0;

        //   await tx.deck.update({
        //     where: { id: deck.id },
        //     data: {
        //       cardCount: totalCards,
        //       progress: progress,
        //     },
        //   });
        // }

        // AI生成回数を更新
        await tx.aiGenerationLimit.update({
          where: {
            id: generationLimit.id,
          },
          data: {
            count: {
              increment: 1,
            },
          },
        });

        return cards;
      });

      return NextResponse.json({
        success: true,
        data: {
          deckId: validatedData.deckId,
          cards: result,
        },
      });
    } catch (error: any) {
      console.error('AI API Error:', error);

      if (error.code === 'insufficient_quota') {
        return NextResponse.json(
          {
            error:
              'AI APIの利用制限に達しました。しばらく時間をおいて再度お試しください。',
            details: error.message,
          },
          { status: 429 },
        );
      }

      return NextResponse.json(
        {
          error: 'AIによる暗記カードの生成に失敗しました',
          details: error.message,
        },
        { status: 500 },
      );
    }
  } catch (error) {
    console.error('Error in add cards API:', error);
    return NextResponse.json(
      {
        error: 'リクエストの処理に失敗しました',
        details:
          error instanceof Error ? error.message : '不明なエラーが発生しました',
      },
      { status: 400 },
    );
  }
}
