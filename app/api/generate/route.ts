import { NextResponse } from 'next/server';
import { z } from 'zod';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const generateSchema = z.object({
  title: z.string().min(2),
  content: z.string().optional(),
  cardFormat: z.enum(['term-meaning', 'question-answer', 'custom']),
  cardCount: z.number().min(1).max(100),
  additionalInstructions: z.string().optional(),
});

function generatePrompt(data: z.infer<typeof generateSchema>) {
  const formatInstructions = {
    'term-meaning': '表に単語や用語、裏にその意味や説明を記載してください。',
    'question-answer': '表に問題、裏にその答えを記載してください。',
    'custom': data.additionalInstructions || '表裏の内容を自由に設定してください。',
  };

  return `
以下の内容で暗記カードを${data.cardCount}枚生成してください。

タイトル: ${data.title}
${data.content ? `学習内容: ${data.content}` : ''}
カード形式: ${formatInstructions[data.cardFormat]}

各カードは以下のJSON形式で出力してください：
{
  "front": "カードの表の内容",
  "back": "カードの裏の内容"
}

${data.additionalInstructions ? `追加指示: ${data.additionalInstructions}` : ''}

注意事項：
- 内容は簡潔で分かりやすく
- 学習効果が高くなるように工夫
- 必ずJSON形式で出力
`;
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const validatedData = generateSchema.parse(body);

    const prompt = generatePrompt(validatedData);

    try {
      const completion = await openai.chat.completions.create({
        model: "gpt-4o-mini",
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

      return NextResponse.json({
        success: true,
        data: {
          title: validatedData.title,
          cards: cards.map((card: any, index: number) => ({
            id: `card-${index + 1}`,
            front: card.front,
            back: card.back,
          })),
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
    console.error('Error in generate API:', error);
    return NextResponse.json(
      { 
        error: 'リクエストの処理に失敗しました',
        details: error instanceof Error ? error.message : '不明なエラーが発生しました'
      },
      { status: 400 }
    );
  }
} 