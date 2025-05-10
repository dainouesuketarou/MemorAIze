'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BrainCircuit } from 'lucide-react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

export default function ErrorPage() {
  const searchParams = useSearchParams();
  const error = searchParams.get('error');

  let errorMessage = 'エラーが発生しました';
  if (error === 'Configuration') {
    errorMessage = '認証の設定に問題があります';
  } else if (error === 'AccessDenied') {
    errorMessage = 'アクセスが拒否されました';
  } else if (error === 'Verification') {
    errorMessage = '認証リンクが無効または期限切れです';
  }

  return (
    <div className="container flex h-screen flex-col items-center justify-center">
      <Link href="/">
        <div className="flex items-center mb-8">
          <BrainCircuit className="h-8 w-8 mr-2 text-primary" />
          <h1 className="text-3xl font-bold">MemorAIze</h1>
        </div>
      </Link>

      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl">認証エラー</CardTitle>
          <CardDescription>
            ログイン中にエラーが発生しました
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-center text-muted-foreground mb-4">
            {errorMessage}
          </p>
          <Link href="/login" className="text-primary hover:underline block text-center">
            ログインページに戻る
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}