'use client';
import { useState, useEffect } from 'react';
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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { LoaderCircle, MinusCircle, PlusCircle } from 'lucide-react';
import { toast } from '@/components/ui/toast';
import { PreviewCard } from './ai-generate-form';
import { PreviewCards } from './preview-cards';
import { cn } from '@/lib/utils';
import { Group } from '@prisma/client';
import { useDispatch } from 'react-redux';
import { updateUsage } from '@/lib/store/slices/aiGenerationLimitSlice';

const formSchema = z.object({
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
});

interface Props {
  deckId: string | string[];
  groups: Group[];
  onSuccess: (data: { title: string; cards: any[] }) => void;
}

export function CardAddAiForm({ deckId, groups, onSuccess }: Props) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [selectedGroupIds, setSelectedGroupIds] = useState<string[]>([]);
  const [generated, setGenerated] = useState<{
    cards: PreviewCard[];
  } | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const dispatch = useDispatch();

  useEffect(() => {
    if (groups.length > 0) {
      setSelectedGroupIds([groups[0].id]);
    }
  }, [groups]);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      content: '',
      cardFormat: 'auto',
      cardAmount: 'normal',
      additionalInstructions: '',
    },
  });

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setError(null);
    setUploadedFiles((prev) => [...prev, files[0]]);

    toast({
      title: 'ファイルがアップロードされました',
      description:
        'フォームに必要事項を入力し、「AIでカードを追加」ボタンを押してください。',
    });
  };

  const removeFile = (index: number) => {
    setUploadedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleRegenerate = async (
    additionalInstructions: string,
  ): Promise<PreviewCard[]> => {
    setIsLoading(true);
    setError(null);

    const res = await fetch('/api/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(additionalInstructions),
    });
    const json = await res.json();
    if (!res.ok || !json.data?.cards?.length)
      throw new Error(json.error || '再生成に失敗しました');

    const newCards = json.data.cards;
    setGenerated({ cards: newCards });
    return newCards;
  };

  const handleSaveCards = (updatedCards: PreviewCard[]) => {
    setGenerated((prev) => (prev ? { ...prev, cards: updatedCards } : null));
  };

  const handleSave = async () => {
    if (!generated) return;
    if (selectedGroupIds.length === 0) {
      toast({
        title: 'エラー',
        description: '少なくとも1つの分野を選択してください',
        variant: 'destructive',
      });
      return;
    }
    setIsLoading(true);
    try {
      const res = await fetch('/api/cards/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          deckId,
          cards: generated.cards,
          groupIds: selectedGroupIds,
        }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.error);
      toast({
        title: 'カードが追加されました',
        description: 'AIによって生成されたカードがデッキに追加されました。',
      });
      setPreviewOpen(false);
      setGenerated(null);
      onSuccess(json.data);
    } catch (e: any) {
      toast({
        title: '保存エラー',
        description: e.message,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsLoading(true);
    setError(null);

    try {
      if (!values.content && uploadedFiles.length === 0) {
        throw new Error(
          'タイトル、学習内容テキスト、またはファイルアップロードのいずれかを入力してください',
        );
      }

      // AI機能使用前にlimitを更新
      dispatch(updateUsage({ monthlyUsage: 1 }));

      let content = values.content;

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

        content = uploadData.data.text;
      }

      // AIによるカード生成
      const response = await fetch('/api/cards/add', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          deckId,
          content,
          cardFormat: values.cardFormat,
          cardAmount: values.cardAmount,
          additionalInstructions: values.additionalInstructions,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || '暗記カードの生成に失敗しました');
      }

      setGenerated(data.data);
      setPreviewOpen(true);
    } catch (error) {
      console.error('Error generating cards:', error);
      setError(
        error instanceof Error ? error.message : '予期せぬエラーが発生しました',
      );
      toast({
        title: 'エラーが発生しました',
        description:
          error instanceof Error
            ? error.message
            : '予期せぬエラーが発生しました',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
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
              <li>学習内容テキスト</li>
              <li>ファイルアップロード</li>
            </ul>
          </div>

          <FormField
            control={form.control}
            name="content"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  学習内容<span className="text-destructive">*</span>
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
                multiple
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
                <ul className="space-y-2">
                  {uploadedFiles.map((file, index) => (
                    <li
                      key={index}
                      className="flex items-center justify-between bg-muted p-2 rounded-md text-sm"
                    >
                      <span className="truncate max-w-xs">{file.name}</span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeFile(index)}
                      >
                        <MinusCircle className="h-4 w-4 text-muted-foreground" />
                      </Button>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

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
                        少なめ（1-5枚）
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
                        普通（5-20枚）
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
                        多め（20-30枚）
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

          <FormField
            control={form.control}
            name="additionalInstructions"
            render={({ field }) => (
              <FormItem>
                <FormLabel>追加指示 (オプション)</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="例）「表をフランス語、裏を日本語にしてください」「計算問題を中心に問題作成してください」など"
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

          {/* グループ選択 */}
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

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? (
              <>
                <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
                生成中...
              </>
            ) : (
              'AIでカードを追加'
            )}
          </Button>
        </form>
      </Form>
      {generated && (
        <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle>生成カードプレビュー</DialogTitle>
              <DialogDescription>
                生成されたカードを確認し、必要に応じて編集できます。
              </DialogDescription>
            </DialogHeader>
            <PreviewCards
              cards={generated.cards}
              onSave={handleSave}
              onRegenerate={handleRegenerate}
              onCardsChange={handleSaveCards}
              isSaving={isLoading}
              onClose={() => setPreviewOpen(false)}
              groups={groups}
              selectedGroupIds={selectedGroupIds}
              onGroupIdsChange={setSelectedGroupIds}
            />
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}
