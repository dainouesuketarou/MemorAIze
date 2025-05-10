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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  RadioGroup, 
  RadioGroupItem 
} from '@/components/ui/radio-group';
import { LoaderCircle, MinusCircle, PlusCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';

const formSchema = z.object({
  title: z.string().min(2, {
    message: '暗記カード帳のタイトルを入力してください。',
  }),
  content: z.string().optional(),
  fileUpload: z.any().optional(),
  cardFormat: z.enum(['term-meaning', 'question-answer', 'custom']),
  cardCount: z.number().min(1).max(100),
  additionalInstructions: z.string().optional(),
});

export function AiGenerateForm() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  
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

  function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    
    // Mock API call for demo
    setTimeout(() => {
      console.log(values);
      console.log('Uploaded files:', uploadedFiles);
      setIsLoading(false);
      router.push('/dashboard');
    }, 2000);
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      setUploadedFiles(prev => [...prev, ...Array.from(files)]);
    }
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

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
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
            '暗記カードを生成'
          )}
        </Button>
      </form>
    </Form>
  );
}