import { NextResponse } from 'next/server';
import { z } from 'zod';
import OpenAI from 'openai';
import { PrismaClient } from '@prisma/client';
import { getServerSession } from 'next-auth';
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

const prisma = new PrismaClient();
const MONTHLY_LIMIT = 5;

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const addCardsSchema = z.object({
  deckId: z.string(),
  content: z.string().optional(),
  cardFormat: z.enum(['term-meaning', 'question-answer', 'custom', 'auto']),
  cardCount: z.number().min(1).max(100),
  additionalInstructions: z.string().optional(),
});

function generatePrompt(data: z.infer<typeof addCardsSchema>) {
  const formatInstructions = {
    'term-meaning': '表に単語や用語、裏にその意味や説明を記載してください。',
    'question-answer': '表に問題、裏にその答えを記載してください。',
    'custom': data.additionalInstructions || '表裏の内容を自由に設定してください。',
    'auto': '内容に応じて最適な形式（単語/意味 または 問題/答え）を選択してください。',
  };

  return `
以下の内容で暗記カードを${data.cardCount}枚生成してください。

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
- 内容は簡潔で分かりやすく
- 学習効果が高くなるように工夫
- 必ず上記のJSON形式で配列として出力
- 余分な説明やテキストは含めないでください
`;
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: '認証が必要です' }, { status: 401 });
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
      return NextResponse.json({
        success: false,
        error: '今月のAI生成回数の上限に達しました。来月までお待ちください。',
      }, { status: 429 });
    }

    const body = await req.json();
    const validatedData = addCardsSchema.parse(body);

    const prompt = generatePrompt(validatedData);

    try {
      const completion = await openai.chat.completions.create({
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content: "あなたは教育の専門家で、効果的な暗記カードを作成するエキスパートです。"
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 4096,
      });

      const response = completion.choices[0].message.content;
      let cards;
      
      try {
        const jsonMatch = response?.match(/\[[\s\S]*\]/);
        if (jsonMatch) {
          cards = JSON.parse(jsonMatch[0]);
        } else {
          throw new Error('Invalid response format');
        }
      } catch (error) {
        console.error('Error parsing AI response:', error);
        throw new Error('AIの応答の解析に失敗しました');
      }

      // データベースにカードを保存
      const result = await prisma.$transaction(async (tx) => {
        const savedCards = [];
        
        for (const card of cards) {
          // カード作成
          const savedCard = await tx.card.create({
            data: {
              deckId: validatedData.deckId,
              front: card.front,
              back: card.back,
              status: 'UNLEARNED',
              order: 0,
            },
          });
          savedCards.push(savedCard);
        }

        // StudyHistory作成
        await tx.studyHistory.create({
          data: {
            deckId: validatedData.deckId,
            progress: 0,
          },
        });

        // Deckの進捗度更新
        const deck = await tx.deck.findUnique({
          where: { id: validatedData.deckId },
          include: {
            cards: true,
          },
        });

        if (deck) {
          const totalCards = deck.cards.length;
          const masteredCount = deck.cards.filter(card => card.status === 'MASTERED').length;
          const progress = totalCards > 0 ? masteredCount / totalCards : 0;

          await tx.deck.update({
            where: { id: deck.id },
            data: {
              cardCount: totalCards,
              progress: progress,
            },
          });
        }

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

        return savedCards;
      });

      return NextResponse.json({
        success: true,
        data: {
          deckId: validatedData.deckId,
          cards: result,
        },
      });
    } catch (error: any) {
      console.error('OpenAI API Error:', error);
      
      if (error.code === 'insufficient_quota') {
        return NextResponse.json(
          { 
            error: 'OpenAI APIの利用制限に達しました。しばらく時間をおいて再度お試しください。',
            details: error.message
          },
          { status: 429 }
        );
      }

      return NextResponse.json(
        { 
          error: 'AIによる暗記カードの生成に失敗しました',
          details: error.message
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error in add cards API:', error);
    return NextResponse.json(
      { 
        error: 'リクエストの処理に失敗しました',
        details: error instanceof Error ? error.message : '不明なエラーが発生しました'
      },
      { status: 400 }
    );
  }
} 