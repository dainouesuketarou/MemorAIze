import { NextResponse } from 'next/server';
import { z } from 'zod';
import { GoogleGenAI } from '@google/genai';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

const googleAI = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

const refreshSchema = z.object({
  cards: z.array(
    z.object({
      front: z.string(),
      back: z.string(),
    }),
  ),
  additionalInstructions: z.string().optional(),
});

function buildRefreshPrompt(data: z.infer<typeof refreshSchema>) {
  const prompt = `
以下の暗記カードセットを、より効果的な学習ができるように改善してください。
${data.additionalInstructions ? `追加指示: ${data.additionalInstructions}` : ''}

現在のカードセット:
${JSON.stringify(data.cards, null, 2)}

以下のJSON形式で配列として出力してください：
[
  {
    "front": "カードの表の内容",
    "back": "カードの裏の内容"
  }
]

注意事項：
- 内容は簡潔で分かりやすく作成してください
- 学習効果が高くなるように工夫してください
- 必ず上記のJSON形式で配列として出力してください
- 余分な説明やテキストは含めないでください
- カードは表や裏面が必ず、問題と答えのペアである必要があります
- 各カードの内容は、元の内容を基に改善してください
- 不適切な内容や著作権に違反する内容は避けてください
`;

  return prompt;
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

    const body = await req.json();
    const validatedData = refreshSchema.parse(body);

    const prompt = buildRefreshPrompt(validatedData);

    try {
      const result = await googleAI.models.generateContent({
        model: 'gemini-2.5-flash-preview-05-20',
        contents: [prompt],
      });
      const text = result.text;

      // JSONの抽出とパース
      const match = text!.match(/\[[\s\S]*\]/);
      if (!match) throw new Error('カードのJSONが見つかりません');
      const cards = JSON.parse(match[0]);

      return NextResponse.json({
        success: true,
        data: {
          cards: cards.map((card: any, index: number) => ({
            id: `card-${index + 1}`,
            front: card.front,
            back: card.back,
          })),
        },
      });
    } catch (error) {
      console.error('Google AI API Error:', error);
      throw new Error('Google AIによるカードの改善に失敗しました');
    }
  } catch (e: any) {
    console.error('refresh API error:', e);
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
