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
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { LoaderCircle, MinusCircle, PlusCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';
import { GeneratingCards } from './generating-cards';
import { PreviewCards } from './preview-cards';
import { toast } from '@/components/ui/toast';
import { Group } from '@prisma/client';

/* ----------------------------- 型定義 ----------------------------- */
export interface PreviewCard {
  id: string;
  front: string;
  back: string;
}

interface AiGenerateFormProps {
  groups: Group[];
}

/* ----------------------------- Zod スキーマ ----------------------------- */
const formSchema = z.object({
  title: z
    .string()
    .max(50, { message: 'タイトルは50文字以内で入力してください。' })
    .optional(),
  content: z
    .string()
    .max(1000, { message: '学習内容は1000文字以内で入力してください。' })
    .optional(),
  cardFormat: z.enum(['term-meaning', 'question-answer', 'auto']),
  cardAmount: z.enum(['few', 'normal', 'many']),
  additionalInstructions: z
    .string()
    .max(500, { message: '追加指示は500文字以内で入力してください。' })
    .optional(),
  groupIds: z.array(z.string()).optional(),
});

/* ===================================================================== */
/*                                親コンポーネント                       */
/* ===================================================================== */
export function AiGenerateForm({ groups }: AiGenerateFormProps) {
  const router = useRouter();
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [selectedGroupIds, setSelectedGroupIds] = useState<string[]>([]);

  /* ------- フォーム関連 ------- */
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: '',
      content: '',
      cardFormat: 'auto',
      cardAmount: 'normal',
      additionalInstructions: '',
      groupIds: [],
    },
  });

  /* ------- 画面状態 ------- */
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /* ------- AI 生成結果を保持 ------- */
  const [title, setTitle] = useState(''); // デッキ名
  const [cards, setCards] = useState<PreviewCard[]>([]); // 常に最新のカード配列
  const [lastPayload, setLastPayload] = useState<any | null>(null); // 再生成用

  /* ------------------------------ 送信ハンドラ ----------------------------- */
  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    setError(null);

    try {
      if (!values.title && !values.content && uploadedFiles.length === 0) {
        throw new Error(
          'タイトル、学習内容テキスト、またはファイルアップロードのいずれかを入力してください',
        );
      }

      /* ---------- API へ投げるペイロードを作成 ---------- */
      const payload = { ...values };

      // ファイルがアップロードされている場合、OCR処理を実行
      if (uploadedFiles.length > 0) {
        const file = uploadedFiles[0];
        const formData = new FormData();
        formData.append('file', file);

        const uploadResponse = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });

        const uploadData = await uploadResponse.json();

        if (!uploadResponse.ok || !uploadData.success) {
          throw new Error(uploadData.error || 'ファイルの処理に失敗しました');
        }

        payload.content = uploadData.data.text;
      }

      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (!res.ok || !json.data?.cards?.length) {
        throw new Error(json.error || '暗記カードの生成に失敗しました');
      }

      /* ---------- 正常時: state 更新 ---------- */
      setTitle(json.data.title);
      setCards(json.data.cards);
      setLastPayload(payload);
      toast({
        title: '暗記カードを生成しました',
        description: 'プレビュー画面で編集できます。',
      });
    } catch (e) {
      const msg =
        e instanceof Error ? e.message : '予期せぬエラーが発生しました';
      setError(msg);
      toast({
        title: 'エラーが発生しました',
        description: msg,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }

  /* ------------------------------ 保存ハンドラ ----------------------------- */
  const handleSave = async (title: string, cards: PreviewCard[]) => {
    if (!cards.length) return;
    if (selectedGroupIds.length === 0) {
      toast({
        title: 'エラー',
        description: '少なくとも1つの分野を選択してください',
        variant: 'destructive',
      });
      return;
    }
    setIsSaving(true);
    setError(null);

    try {
      const res = await fetch('/api/decks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          cards: cards.map(({ front, back }) => ({ front, back })),
          groupIds: selectedGroupIds,
          cardCount: cards.length,
          progress: 0,
          lastStudied: null,
        }),
      });
      const json = await res.json();
      if (!res.ok || !json.success)
        throw new Error(json.error || 'デッキの保存に失敗しました');
      router.push('/dashboard');
    } catch (e) {
      const msg =
        e instanceof Error ? e.message : '予期せぬエラーが発生しました';
      setError(msg);
      toast({
        title: 'エラーが発生しました',
        description: msg,
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  /* ------------------------------ 再生成ハンドラ ----------------------------- */
  async function regenerateCards(additional: string): Promise<PreviewCard[]> {
    if (!lastPayload) throw new Error('初回生成情報がありません');
    const payload = {
      ...lastPayload,
      additionalInstructions: additional,
    };

    const res = await fetch('/api/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const json = await res.json();
    if (!res.ok || !json.data?.cards?.length)
      throw new Error(json.error || '再生成に失敗しました');

    /* 親 state 更新 → 子にも自動反映 */
    setCards(json.data.cards);
    return json.data.cards;
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    if (file.size > 1024 * 1024) {
      // 1MB
      toast({
        title: 'エラー',
        description: 'ファイルサイズは1MB以下にしてください。',
        variant: 'destructive',
      });
      return;
    }

    setUploadedFiles([file]);
    toast({
      title: 'ファイルがアップロードされました',
      description:
        'フォームに必要事項を入力し、「暗記カードを生成」ボタンを押してください。',
    });
  };

  const removeFile = () => {
    setUploadedFiles([]);
  };

  /* ------------------------------ JSX ----------------------------- */
  return (
    <Form {...form}>
      {isLoading ? (
        <GeneratingCards />
      ) : cards.length ? (
        <PreviewCards
          title={title}
          cards={cards}
          onSave={() => handleSave(title, cards)}
          isSaving={isSaving}
          onCardsChange={setCards}
          onRegenerate={regenerateCards}
          groups={groups}
          selectedGroupIds={selectedGroupIds}
          onGroupIdsChange={setSelectedGroupIds}
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

          <div className="p-4 bg-muted/50 rounded-lg space-y-2">
            <p className="text-sm font-medium">
              以下のいずれかを入力してください：
            </p>
            <ul className="text-sm text-muted-foreground list-disc list-inside space-y-1">
              <li>暗記カード帳のタイトル</li>
              <li>学習内容テキスト</li>
              <li>ファイルアップロード</li>
            </ul>
            <p className="text-sm text-muted-foreground mt-2">
              タイトルのみを入力した場合、AIがタイトルから内容を推測してカードを生成します。
            </p>
          </div>

          {/* -- タイトル -- */}
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  暗記カード帳のタイトル
                  <span className="text-destructive">*</span>
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder="例）英検準一級英単語"
                    maxLength={50}
                    {...field}
                  />
                </FormControl>
                <FormDescription>
                  50文字以内で入力してください。未入力の場合はAIが生成します。
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* -- ファイルアップロード -- */}
          <div className="space-y-2">
            <FormLabel className="flex items-center gap-1">
              ファイルアップロード
              <span className="text-destructive">*</span>
            </FormLabel>
            <div
              className="border-2 border-dashed rounded-md p-6 text-center cursor-pointer hover:bg-muted/50 transition-colors"
              onClick={() => document.getElementById('file-upload')?.click()}
            >
              <Input
                id="file-upload"
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                className="hidden"
                onChange={handleFileChange}
              />
              <div className="space-y-2">
                <div className="text-sm text-muted-foreground">
                  クリックしてファイルを選択、または
                  <br />
                  ファイルをドラッグ＆ドロップ
                </div>
                <div className="text-xs text-muted-foreground">
                  PDF, JPG, PNGがサポートされています (最大1MB)
                </div>
              </div>
            </div>

            {uploadedFiles.length > 0 && (
              <div className="mt-4 space-y-2">
                <p className="text-sm font-medium">
                  アップロードされたファイル:
                </p>
                <div className="flex items-center justify-between bg-muted p-2 rounded-md text-sm">
                  <span className="truncate max-w-xs">
                    {uploadedFiles[0].name}
                  </span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={removeFile}
                  >
                    <MinusCircle className="h-4 w-4 text-muted-foreground" />
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* -- 学習内容テキスト -- */}
          <FormField
            control={form.control}
            name="content"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  学習内容テキスト<span className="text-destructive">*</span>
                </FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="ここに暗記カードとして作成したい学習ドキュメントをコピー＆ペーストしてください。例）「英検準一級の単語リスト」「生物学の教科書の該当ページ」など"
                    className="min-h-[120px]"
                    maxLength={1000}
                    {...field}
                  />
                </FormControl>
                <FormDescription>
                  1000文字以内で入力してください
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* -- グループ選択 -- */}
          <div className="space-y-4">
            <FormLabel className="text-base">分野（複数選択可）</FormLabel>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {groups.map((group) => (
                <label
                  key={group.id}
                  className={cn(
                    'relative flex items-center justify-center p-3 rounded-lg border-2 cursor-pointer transition-all duration-200',
                    selectedGroupIds.includes(group.id)
                      ? 'border-primary bg-primary/5'
                      : 'border-muted-foreground/20 hover:border-primary/50',
                  )}
                >
                  <input
                    type="checkbox"
                    className="sr-only"
                    checked={selectedGroupIds.includes(group.id)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedGroupIds((prev) => [...prev, group.id]);
                      } else {
                        setSelectedGroupIds((prev) =>
                          prev.filter((id) => id !== group.id),
                        );
                      }
                    }}
                  />
                  <span
                    className={cn(
                      'text-sm font-medium',
                      selectedGroupIds.includes(group.id)
                        ? 'text-primary'
                        : 'text-muted-foreground',
                    )}
                  >
                    {group.name}
                  </span>
                </label>
              ))}
            </div>
          </div>

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
                      <FormControl>
                        <RadioGroupItem value="auto" />
                      </FormControl>
                      <FormLabel className="font-normal">
                        オート（AIが最適な形式を選択）
                      </FormLabel>
                    </FormItem>
                    <FormDescription>
                      オートを選択すると、AIが内容に応じて最適な形式を選択します
                    </FormDescription>
                    <FormItem className="flex items-center space-x-3 space-y-0">
                      <FormControl>
                        <RadioGroupItem value="term-meaning" />
                      </FormControl>
                      <FormLabel className="font-normal">
                        表: 単語 / 裏: 意味
                      </FormLabel>
                    </FormItem>
                    <FormItem className="flex items-center space-x-3 space-y-0">
                      <FormControl>
                        <RadioGroupItem value="question-answer" />
                      </FormControl>
                      <FormLabel className="font-normal">
                        表: 問題 / 裏: 答え
                      </FormLabel>
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
            name="cardAmount"
            render={({ field }) => (
              <FormItem>
                <FormLabel>カード枚数</FormLabel>
                <FormControl>
                  <RadioGroup
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    className="flex flex-col space-y-1"
                  >
                    <FormItem className="flex items-center space-x-3 space-y-0">
                      <FormControl>
                        <RadioGroupItem value="few" />
                      </FormControl>
                      <FormLabel className="font-normal">
                        少なめ（最大5枚）
                        <span className="text-sm text-muted-foreground block">
                          暗記レベル40-60%を目指す
                        </span>
                      </FormLabel>
                    </FormItem>
                    <FormItem className="flex items-center space-x-3 space-y-0">
                      <FormControl>
                        <RadioGroupItem value="normal" />
                      </FormControl>
                      <FormLabel className="font-normal">
                        普通（最大20枚）
                        <span className="text-sm text-muted-foreground block">
                          暗記レベル60-80%を目指す
                        </span>
                      </FormLabel>
                    </FormItem>
                    <FormItem className="flex items-center space-x-3 space-y-0">
                      <FormControl>
                        <RadioGroupItem value="many" />
                      </FormControl>
                      <FormLabel className="font-normal">
                        多め（最大30枚）
                        <span className="text-sm text-muted-foreground block">
                          暗記レベル80-90%を目指す
                        </span>
                      </FormLabel>
                    </FormItem>
                  </RadioGroup>
                </FormControl>
                <FormDescription>
                  内容に応じて、AIが適切な枚数を選択します
                </FormDescription>
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
                    maxLength={500}
                    {...field}
                  />
                </FormControl>
                <FormDescription>500文字以内で入力してください</FormDescription>
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
