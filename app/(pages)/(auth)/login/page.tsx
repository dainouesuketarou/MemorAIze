'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { Button } from '@/src/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
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
import { Separator } from '@/src/components/ui/separator';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { signIn } from 'next-auth/react';
import { useSession } from 'next-auth/react';

const formSchema = z.object({
  email: z.string().email({
    message: 'メールアドレスの形式が正しくありません。',
  }),
});

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { data: session, status } = useSession();

  // 重複実行を防ぐためのref
  const hasCheckedOnboarding = useRef(false);
  const isRedirecting = useRef(false);

  const checkOnboardingStatus = useCallback(async () => {
    // 既にチェック済みの場合はスキップ
    if (hasCheckedOnboarding.current) {
      console.log('オンボーディング状態は既にチェック済み');
      return;
    }

    hasCheckedOnboarding.current = true;
    console.log('オンボーディング状態をチェック開始');

    try {
      const response = await fetch('/api/auth/onboarding/status');
      const data = await response.json();

      // ログイン履歴を記録（日本時間で記録）
      const now = new Date();
      const jpNow = new Date(now.getTime() + 9 * 60 * 60 * 1000);
      await fetch('/api/auth/login-history', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          loginAt: jpNow.toISOString(),
        }),
      });

      if (!data.isOnboarded) {
        console.log('オンボーディング未完了、オンボーディングページに遷移');
        router.push('/onboarding');
      } else {
        console.log('オンボーディング完了、ダッシュボードに遷移');
        router.push('/dashboard');
      }
    } catch (error) {
      console.error('オンボーディング状態の確認に失敗しました:', error);
      router.push('/dashboard');
    }
  }, [router]);

  // 認証済みの場合はオンボーディング状態をチェック
  useEffect(() => {
    if (isRedirecting.current) {
      return;
    }

    if (status === 'authenticated' && session?.user?.email) {
      isRedirecting.current = true;
      console.log('認証完了、オンボーディング状態をチェック');
      checkOnboardingStatus();
    }
  }, [status, session, checkOnboardingStatus]);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    try {
      const result = await signIn('email', {
        email: values.email,
        redirect: false,
      });

      if (result?.error) {
        throw new Error(result.error);
      }

      router.push(`/auth/email-sent?email=${encodeURIComponent(values.email)}`);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : 'エラーが発生しました',
      );
    } finally {
      setIsLoading(false);
    }
  }

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    try {
      const result = await signIn('google', { redirect: false });
      if (result?.error) {
        throw new Error(result.error);
      }

      // Googleログイン後はセッション確認を待ってからオンボーディング状態をチェック
      console.log('Googleログイン成功、セッション確認を待機');

      // セッション確認を待機（短時間）
      let retryCount = 0;
      const maxRetries = 3;

      while (retryCount < maxRetries) {
        try {
          const sessionData = await fetch('/api/auth/session').then((res) =>
            res.json(),
          );

          if (sessionData?.user?.email) {
            console.log('セッション確認成功、オンボーディング状態をチェック');
            await checkOnboardingStatus();
            break;
          }

          retryCount++;
          await new Promise((resolve) => setTimeout(resolve, 100));
        } catch (error) {
          console.error('セッション確認エラー:', error);
          retryCount++;
        }
      }

      if (retryCount === maxRetries) {
        console.log('セッション確認タイムアウト、ダッシュボードに遷移');
        router.push('/dashboard');
      }
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : 'エラーが発生しました',
      );
    } finally {
      setIsLoading(false);
    }
  };

  // ローディング中は何も表示しない
  if (status === 'loading') {
    return null;
  }

  // すでに認証済みの場合は何も表示しない
  if (status === 'authenticated') {
    return null;
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen w-full px-4 sm:px-8">
      <div className="w-full max-w-2xl mx-auto">
        <Link href="/">
          <div className="flex items-center mb-8 justify-center">
            <Image
              src="/logo.png"
              alt="MemorAIze"
              width={64}
              height={64}
              className="h-16 w-16 text-primary"
            />
            <h1 className="text-3xl font-bold">MemorAIze</h1>
          </div>
        </Link>

        <Card className="w-full max-w-md mx-auto">
          <CardHeader>
            <CardTitle className="text-2xl">ログイン / 登録</CardTitle>
            <CardDescription>
              メールまたはGoogleアカウントで続行します
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6">
              <Button
                variant="outline"
                className="w-full"
                onClick={handleGoogleSignIn}
                disabled={isLoading}
              >
                <svg
                  className="mr-2 h-4 w-4"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 48 48"
                >
                  <path
                    fill="#FFC107"
                    d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"
                  ></path>
                  <path
                    fill="#FF3D00"
                    d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"
                  ></path>
                  <path
                    fill="#4CAF50"
                    d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"
                  ></path>
                  <path
                    fill="#1976D2"
                    d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z"
                  ></path>
                </svg>
                Googleでログイン
              </Button>
            </div>
            <div className="relative my-4">
              <div className="absolute inset-0 flex items-center">
                <Separator />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">
                  または
                </span>
              </div>
            </div>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-4"
              >
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>メールアドレス</FormLabel>
                      <FormControl>
                        <Input placeholder="example@email.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? '送信中...' : 'メールアドレスで続ける'}
                </Button>
              </form>
            </Form>
          </CardContent>
          <CardFooter className="flex justify-center text-center text-sm text-muted-foreground">
            <p>
              続行することにより、利用規約およびプライバシーポリシーに同意したことになります。
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
