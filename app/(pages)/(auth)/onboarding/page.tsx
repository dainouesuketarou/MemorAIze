'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { Button } from '@/src/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/src/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/src/components/ui/form';
import { Input } from '@/src/components/ui/input';
import { Checkbox } from '@/src/components/ui/checkbox';
import { toast } from 'sonner';
import { useSession } from 'next-auth/react';
import { BrainCircuit } from 'lucide-react';

const formSchema = z.object({
  username: z
    .string()
    .min(2, {
      message: 'ユーザー名は2文字以上で入力してください。',
    })
    .max(20, {
      message: 'ユーザー名は20文字以下で入力してください。',
    }),
  purposes: z
    .array(
      z.enum([
        'QUALIFICATION',
        'SCHOOL_EXAM',
        'QUIZ_TRAINING',
        'LANGUAGE_LEARNING',
        'OTHER',
      ]),
    )
    .min(1, {
      message: '少なくとも1つの目的を選択してください。',
    }),
});

const PURPOSE_OPTIONS = [
  { id: 'QUALIFICATION', label: '資格対策' },
  { id: 'SCHOOL_EXAM', label: '学校の試験対策' },
  { id: 'QUIZ_TRAINING', label: 'クイズトレーニング' },
  { id: 'LANGUAGE_LEARNING', label: '語学学習' },
  { id: 'OTHER', label: 'その他' },
] as const;

export default function OnboardingPage() {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { data: session, update: updateSession } = useSession();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: '',
      purposes: [],
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    try {
      const response = await fetch('/api/auth/onboarding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      });

      if (!response.ok) {
        throw new Error('オンボーディングの保存に失敗しました');
      }

      // セッションを更新
      await updateSession();
      toast.success('設定が完了しました！');
      router.push('/dashboard');
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : 'エラーが発生しました',
      );
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen w-full px-4 sm:px-8">
      <div className="w-full max-w-2xl mx-auto">
        <div className="flex items-center mb-8 justify-center">
          <BrainCircuit className="h-8 w-8 mr-2 text-primary" />
          <h1 className="text-3xl font-bold">MemorAIze</h1>
        </div>

        <Card className="w-full max-w-md mx-auto">
          <CardHeader>
            <CardTitle className="text-2xl">はじめまして！</CardTitle>
            <CardDescription>
              MemorAIzeをより良い体験にするために、いくつか設定をお願いします。
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-6"
              >
                <FormField
                  control={form.control}
                  name="username"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>ユーザー名</FormLabel>
                      <FormControl>
                        <Input placeholder="あなたの名前" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="purposes"
                  render={() => (
                    <FormItem>
                      <div className="mb-4">
                        <FormLabel>MemorAIzeを使用する目的</FormLabel>
                        <p className="text-sm text-muted-foreground">
                          当てはまるものをすべて選択してください
                        </p>
                      </div>
                      <div className="grid gap-4">
                        {PURPOSE_OPTIONS.map((purpose) => (
                          <FormField
                            key={purpose.id}
                            control={form.control}
                            name="purposes"
                            render={({ field }) => {
                              return (
                                <FormItem
                                  key={purpose.id}
                                  className="flex flex-row items-start space-x-3 space-y-0"
                                >
                                  <FormControl>
                                    <Checkbox
                                      checked={field.value?.includes(
                                        purpose.id as any,
                                      )}
                                      onCheckedChange={(checked) => {
                                        return checked
                                          ? field.onChange([
                                              ...field.value,
                                              purpose.id,
                                            ])
                                          : field.onChange(
                                              field.value?.filter(
                                                (value) => value !== purpose.id,
                                              ),
                                            );
                                      }}
                                    />
                                  </FormControl>
                                  <FormLabel className="font-normal">
                                    {purpose.label}
                                  </FormLabel>
                                </FormItem>
                              );
                            }}
                          />
                        ))}
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? '保存中...' : 'はじめる'}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
