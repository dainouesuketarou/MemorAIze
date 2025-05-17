'use client';

import { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  RadioGroup,
  RadioGroupItem,
} from '@/components/ui/radio-group';
import { LoaderCircle, MinusCircle, PlusCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';
import { GeneratingCards } from './generating-cards';
import { PreviewCards } from './preview-cards';
import { toast } from '@/components/ui/toast';

/* ----------------------------- 型定義 ----------------------------- */
export interface PreviewCard {
  id: string;
  front: string;
  back: string;
}

/* ----------------------------- Zod スキーマ ----------------------------- */
const formSchema = z.object({
  title: z.string().min(2, { message: '暗記カード帳のタイトルを入力してください。' }),
  content: z.string().optional(),
  cardFormat: z.enum(['term-meaning', 'question-answer', 'custom']),
  cardCount: z.number().min(1).max(100),
  additionalInstructions: z.string().optional(),
});

/* ===================================================================== */
/*                                親コンポーネント                       */
/* ===================================================================== */
export function AiGenerateForm() {
  const router = useRouter();

  /* ------- フォーム関連 ------- */
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: '',
      content: '',
      cardFormat: 'term-meaning',
      cardCount: 10,
      additionalInstructions: '',
    },
  });

  /* ------- 画面状態 ------- */
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /* ------- AI 生成結果を保持 ------- */
  const [title, setTitle]       = useState('');               // デッキ名
  const [cards, setCards]       = useState<PreviewCard[]>([]); // 常に最新のカード配列
  const [lastPayload, setLastPayload] = useState<any | null>(null); // 再生成用

  /* ------------------------------ 送信ハンドラ ----------------------------- */
  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    setError(null);

    try {
      /* ---------- API へ投げるペイロードを作成 ---------- */
      const payload = { ...values };        // ここではファイル/OCR 処理を省略
      const res = await fetch('/api/generate', {
        method : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body   : JSON.stringify(payload),
      });
      const json = await res.json();
      if (!res.ok || !json.data?.cards?.length) {
        throw new Error(json.error || '暗記カードの生成に失敗しました');
      }

      /* ---------- 正常時: state 更新 ---------- */
      setTitle(json.data.title);
      setCards(json.data.cards);
      setLastPayload(payload);
      toast({ title: '暗記カードを生成しました', description: 'プレビュー画面で編集できます。' });
    } catch (e) {
      const msg = e instanceof Error ? e.message : '予期せぬエラーが発生しました';
      setError(msg);
      toast({ title: 'エラーが発生しました', description: msg, variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  }

  /* ------------------------------ 保存ハンドラ ----------------------------- */
  const handleSave = async () => {
    if (!cards.length) return;
    setIsSaving(true);
    setError(null);

    try {
      const res = await fetch('/api/decks', {
        method : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body   : JSON.stringify({
          title,
          cards: cards.map(({ front, back }) => ({ front, back })),
        }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.error || 'デッキの保存に失敗しました');
      router.push('/dashboard');
    } catch (e) {
      const msg = e instanceof Error ? e.message : '予期せぬエラーが発生しました';
      setError(msg);
      toast({ title: 'エラーが発生しました', description: msg, variant: 'destructive' });
    } finally {
      setIsSaving(false);
    }
  };

  /* ------------------------------ 再生成ハンドラ ----------------------------- */
  async function regenerateCards(additional: string): Promise<PreviewCard[]> {
    if (!lastPayload) throw new Error('初回生成情報がありません');
    const payload = { ...lastPayload, additionalInstructions: additional, cardCount: cards.length };

    const res   = await fetch('/api/generate', {
      method : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body   : JSON.stringify(payload),
    });
    const json  = await res.json();
    if (!res.ok || !json.data?.cards?.length) throw new Error(json.error || '再生成に失敗しました');

    /* 親 state 更新 → 子にも自動反映 */
    setCards(json.data.cards);
    return json.data.cards;
  }

  /* ------------------------------ JSX ----------------------------- */
  return (
    <Form {...form}>
      {isLoading ? (
        <GeneratingCards />
      ) : cards.length ? (
        <PreviewCards
          title={title}
          cards={cards}
          onSave={handleSave}
          isSaving={isSaving}
          onCardsChange={setCards}        /* ← 編集・削除・追加を受け取る */
          onRegenerate={regenerateCards}  /* ← 追加指示で再生成 */
        />
      ) : (
        /* ---------- 最初の入力フォーム ---------- */
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* エラー表示 */}
          {error && (
            <div className="p-4 bg-destructive/10 text-destructive rounded-md">
              <p className="text-sm font-medium">{error}</p>
            </div>
          )}

          {/* -- タイトル -- */}
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>暗記カード帳のタイトル</FormLabel>
                <FormControl>
                  <Input placeholder="例）英検準一級英単語" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* -- 学習内容テキスト -- */}
          <FormField
            control={form.control}
            name="content"
            render={({ field }) => (
              <FormItem>
                <FormLabel>学習内容テキスト</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="例）「英検準一級英単語」「生物学基礎の定期試験対策」など"
                    className="min-h-[120px]"
                    {...field}
                  />
                </FormControl>
                <FormDescription>学習したい内容を入力してください。</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* -- カード形式 -- */}
          <FormField
            control={form.control}
            name="cardFormat"
            render={({ field }) => (
              <FormItem>
                <FormLabel>カードの形式</FormLabel>
                <FormControl>
                  <RadioGroup
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    className="flex flex-col space-y-1"
                  >
                    <FormItem className="flex items-center space-x-3 space-y-0">
                      <FormControl><RadioGroupItem value="term-meaning" /></FormControl>
                      <FormLabel className="font-normal">表: 単語 / 裏: 意味</FormLabel>
                    </FormItem>
                    <FormItem className="flex items-center space-x-3 space-y-0">
                      <FormControl><RadioGroupItem value="question-answer" /></FormControl>
                      <FormLabel className="font-normal">表: 問題 / 裏: 答え</FormLabel>
                    </FormItem>
                    <FormItem className="flex items-center space-x-3 space-y-0">
                      <FormControl><RadioGroupItem value="custom" /></FormControl>
                      <FormLabel className="font-normal">カスタム</FormLabel>
                    </FormItem>
                  </RadioGroup>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* -- カード枚数 -- */}
          <FormField
            control={form.control}
            name="cardCount"
            render={({ field }) => (
              <FormItem>
                <FormLabel>カード枚数 (1–100)</FormLabel>
                <div className="flex items-center space-x-4">
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => field.onChange(Math.max(field.value - 5, 1))}
                    disabled={field.value <= 1}
                    className="h-8 w-8"
                  >
                    <MinusCircle className="h-4 w-4" />
                  </Button>
                  <FormControl>
                    <Input
                      type="number"
                      min={1}
                      max={100}
                      className="w-20 text-center"
                      value={field.value}
                      onChange={(e) => field.onChange(parseInt(e.target.value, 10) || 1)}
                    />
                  </FormControl>
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => field.onChange(Math.min(field.value + 5, 100))}
                    disabled={field.value >= 100}
                    className="h-8 w-8"
                  >
                    <PlusCircle className="h-4 w-4" />
                  </Button>
                  <span className="text-sm text-muted-foreground">枚</span>
                </div>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* -- 追加指示 -- */}
          <FormField
            control={form.control}
            name="additionalInstructions"
            render={({ field }) => (
              <FormItem>
                <FormLabel>追加指示 (オプション)</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="例）「表をフランス語、裏を日本語にしてください」など"
                    className="min-h-[80px]"
                    {...field}
                  />
                </FormControl>
                <FormDescription>特別な要望や指示があれば入力してください。</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* -- 送信ボタン -- */}
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? (
              <>
                <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
                生成中...
              </>
            ) : (
              '暗記カードを生成'
            )}
          </Button>
        </form>
      )}
    </Form>
  );
}
