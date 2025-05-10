'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BrainCircuit } from 'lucide-react';
import Link from 'next/link';

export default function VerifyRequestPage() {
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
          <CardTitle className="text-2xl">メールを確認してください</CardTitle>
          <CardDescription>
            ログインリンクを記載したメールを送信しました
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-center text-muted-foreground">
            メールに記載されているリンクをクリックしてログインを完了してください。
            メールが届かない場合は、迷惑メールフォルダもご確認ください。
          </p>
        </CardContent>
      </Card>
    </div>
  );
}