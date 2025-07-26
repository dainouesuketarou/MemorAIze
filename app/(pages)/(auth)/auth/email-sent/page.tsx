'use client';

import { useState } from 'react';
import { useSearchParams } from 'next/navigation';
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
import { BrainCircuit } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { signIn } from 'next-auth/react';

const formSchema = z.object({
  token: z.string().min(6, {
    message: 'トークンは6文字以上必要です。',
  }),
});

export default function EmailSentPage() {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get('email');

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      token: '',
    },
  });

  const checkOnboardingStatus = async () => {
    try {
      const response = await fetch('/api/auth/onboarding/status');
      const data = await response.json();
      if (!data.isOnboarded) {
        router.push('/onboarding');
      } else {
        router.push('/dashboard');
      }
    } catch (error) {
      console.error('オンボーディング状態の確認に失敗しました:', error);
      router.push('/dashboard'); // エラー時はダッシュボードにフォールバック
    }
  };

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!email) {
      toast.error('メールアドレスが見つかりません');
      return;
    }

    setIsLoading(true);
    try {
      const result = await signIn('otp', {
        email,
        otp: values.token,
        redirect: false,
      });

      if (result?.error) {
        form.setError('token', {
          type: 'manual',
          message:
            result.error === 'CredentialsSignin'
              ? 'ワンタイムパスワードが間違っているか有効期限が切れています'
              : '認証に失敗しました',
        });
        return;
      }

      // 認証成功後、オンボーディング状態をチェック
      await checkOnboardingStatus();
    } catch (error) {
      form.setError('token', {
        type: 'manual',
        message:
          error instanceof Error ? error.message : 'エラーが発生しました',
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen w-full px-4 sm:px-8">
      <div className="w-full max-w-2xl mx-auto">
        <Link href="/">
          <div className="flex items-center mb-8 justify-center">
            <BrainCircuit className="h-8 w-8 mr-2 text-primary" />
            <h1 className="text-3xl font-bold">MemorAIze</h1>
          </div>
        </Link>

        <Card className="w-full max-w-md mx-auto">
          <CardHeader>
            <CardTitle className="text-2xl">メールを送信しました</CardTitle>
            <CardDescription>
              {email} 宛にワンタイムパスワードを送信しました。
              <br />
              メールをご確認ください。
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-center">
              <p className="text-sm text-muted-foreground">
                メールが届かない場合は、迷惑メールフォルダをご確認ください。
              </p>
            </div>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-4"
              >
                <FormField
                  control={form.control}
                  name="token"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>ワンタイムパスワード</FormLabel>
                      <FormControl>
                        <Input placeholder="123456" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? '認証中...' : '認証する'}
                </Button>
              </form>
            </Form>
            <div className="flex justify-center">
              <Button asChild variant="outline" className="w-full">
                <Link href="/login">ログインページに戻る</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
