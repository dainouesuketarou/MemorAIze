"use client";
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
  RadioGroupItem 
} from '@/components/ui/radio-group';
import { LoaderCircle, MinusCircle, PlusCircle } from 'lucide-react';
import { toast } from '@/components/ui/toast';

const formSchema = z.object({
  content: z.string().optional(),
  cardFormat: z.enum(['term-meaning', 'question-answer', 'custom']),
  cardCount: z.number().min(1).max(100),
  additionalInstructions: z.string().optional(),
});

interface Props {
  deckId: string | string[];
  onSuccess: () => void;
}

export function CardAddAiForm({ deckId, onSuccess }: Props) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [generatedCards, setGeneratedCards] = useState<{
    title: string;
    cards: Array<{ id: string; front: string; back: string; }>;
  } | null>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      content: '',
      cardFormat: 'term-meaning',
      cardCount: 10,
      additionalInstructions: '',
    },
  });

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setError(null);
    setUploadedFiles(prev => [...prev, files[0]]);

    toast({
      title: "ファイルがアップロードされました",
      description: "フォームに必要事項を入力し、「AIでカードを追加」ボタンを押してください。",
    });
  };

  const removeFile = (index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const increaseCardCount = () => {
    const currentCount = form.getValues('cardCount');
    form.setValue('cardCount', Math.min(currentCount + 5, 100));
  };

  const decreaseCardCount = () => {
    const currentCount = form.getValues('cardCount');
    form.setValue('cardCount', Math.max(currentCount - 5, 1));
  };

  const handleRegenerate = async (additionalInstructions: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const formValues = form.getValues();
      if (!formValues.content && uploadedFiles.length === 0) {
        throw new Error('テキスト入力またはファイルアップロードが必要です');
      }

      let content = formValues.content;

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
          cardFormat: formValues.cardFormat,
          cardCount: formValues.cardCount,
          additionalInstructions: additionalInstructions || formValues.additionalInstructions,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || '暗記カードの生成に失敗しました');
      }

      setGeneratedCards(data.data);
    } catch (error) {
      console.error('Error generating cards:', error);
      setError(error instanceof Error ? error.message : '予期せぬエラーが発生しました');
      toast({
        title: "エラーが発生しました",
        description: error instanceof Error ? error.message : '予期せぬエラーが発生しました',
        variant: "destructive",
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
        throw new Error('テキスト入力またはファイルアップロードが必要です');
      }

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
          cardCount: values.cardCount,
          additionalInstructions: values.additionalInstructions,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.error || '暗記カードの生成に失敗しました');
      }

      onSuccess();
      toast({
        title: "カードが追加されました",
        description: "AIによって生成されたカードがデッキに追加されました。",
      });
    } catch (error) {
      console.error('Error generating cards:', error);
      setError(error instanceof Error ? error.message : '予期せぬエラーが発生しました');
      toast({
        title: "エラーが発生しました",
        description: error instanceof Error ? error.message : '予期せぬエラーが発生しました',
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {error && (
          <div className="p-4 bg-destructive/10 text-destructive rounded-md">
            <p className="text-sm font-medium">{error}</p>
          </div>
        )}
        
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-medium mb-2">学習内容</h3>
            <p className="text-sm text-muted-foreground mb-4">
              テキスト入力、またはファイルアップロードから暗記カードを生成します。
            </p>
          </div>
          
          <FormField
            control={form.control}
            name="content"
            render={({ field }) => (
              <FormItem>
                <FormLabel>テキスト入力</FormLabel>
                <FormControl>
                  <Textarea 
                    placeholder="例）「英検準一級英単語」、「生物学基礎の定期試験対策」など" 
                    className="min-h-[120px]" 
                    {...field} 
                  />
                </FormControl>
                <FormDescription>
                  学習したい内容のテキストを入力してください。
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <div className="space-y-2">
            <FormLabel>ファイルアップロード</FormLabel>
            <div className="border-2 border-dashed rounded-md p-6 text-center cursor-pointer hover:bg-muted/50 transition-colors"
                 onClick={() => document.getElementById('file-upload')?.click()}>
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
                <p className="text-sm font-medium">アップロードされたファイル:</p>
                <ul className="space-y-2">
                  {uploadedFiles.map((file, index) => (
                    <li key={index} className="flex items-center justify-between bg-muted p-2 rounded-md text-sm">
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
                      <RadioGroupItem value="term-meaning" />
                    </FormControl>
                    <FormLabel className="font-normal">
                      表: 単語、裏: 意味
                    </FormLabel>
                  </FormItem>
                  <FormItem className="flex items-center space-x-3 space-y-0">
                    <FormControl>
                      <RadioGroupItem value="question-answer" />
                    </FormControl>
                    <FormLabel className="font-normal">
                      表: 問題、裏: 答え
                    </FormLabel>
                  </FormItem>
                  <FormItem className="flex items-center space-x-3 space-y-0">
                    <FormControl>
                      <RadioGroupItem value="custom" />
                    </FormControl>
                    <FormLabel className="font-normal">
                      カスタム (追加指示で詳細を指定)
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
          name="cardCount"
          render={({ field }) => (
            <FormItem>
              <FormLabel>カード枚数 (1-100)</FormLabel>
              <div className="flex items-center space-x-4">
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={decreaseCardCount}
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
                    {...field}
                    onChange={(e) => field.onChange(parseInt(e.target.value, 10) || 1)}
                  />
                </FormControl>
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={increaseCardCount}
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
                  {...field}
                />
              </FormControl>
              <FormDescription>
                特別な要望や指示があれば入力してください。
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <Button 
          type="submit" 
          className="w-full" 
          disabled={isLoading}
        >
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
  );
} 