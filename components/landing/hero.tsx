'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Link from 'next/link';
import { BrainCircuit } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

export function LandingHero() {
  const router = useRouter();
  const { data: session, status } = useSession();

  const handleStart = () => {
    if (status === 'authenticated') {
      router.push('/dashboard');
    } else {
      router.push('/login');
    }
  };

  return (
    <div
      className="bg-gradient-to-b from-muted/50 to-muted pb-16 pt-10 w-full"
      role="banner"
    >
      <div className="w-full px-4 md:px-6 lg:px-8">
        <nav
          className="flex items-center justify-between max-w-[1400px] mx-auto"
          aria-label="メインナビゲーション"
        >
          <div className="flex items-center gap-2">
            <BrainCircuit className="h-8 w-8 text-primary" aria-hidden="true" />
            <h1 className="text-2xl font-bold">
              <Link href="/" className="hover:opacity-80 transition-opacity">
                MemorAIze
              </Link>
            </h1>
          </div>
          <div>
            <Link href="/login">
              <Button aria-label="ログインまたは新規登録">
                ログイン / 登録
              </Button>
            </Link>
          </div>
        </nav>

        <div className="grid gap-6 lg:grid-cols-2 lg:gap-12 mt-16 items-center max-w-[1400px] mx-auto">
          <div className="flex flex-col justify-center space-y-4">
            <div className="space-y-2">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                AIを使って効率的に
                <span className="text-primary"> 暗記学習</span>
              </h2>
              <p className="max-w-[600px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                PDFや画像をアップロードするだけで、AIが最適な暗記カードを生成。
                効率的な学習で記憶の定着を最大化します。
              </p>
            </div>
            <div className="flex flex-col gap-2 min-[400px]:flex-row">
              <Button
                size="lg"
                className="w-full md:w-auto"
                onClick={handleStart}
                aria-label="アプリを始める"
              >
                はじめる
              </Button>
              <Link href="#features" className="w-full md:w-auto">
                <Button
                  size="lg"
                  variant="outline"
                  className="w-full"
                  aria-label="機能一覧を見る"
                >
                  機能を見る
                </Button>
              </Link>
            </div>
          </div>
          <div className="flex justify-center" aria-label="アプリのプレビュー">
            <div className="relative w-full max-w-[500px] aspect-square">
              <div
                className="absolute w-full h-full bg-gradient-to-br from-purple-500/20 to-indigo-500/20 rounded-3xl transform -rotate-6 scale-95"
                aria-hidden="true"
              ></div>
              <div className="relative bg-white shadow-lg rounded-3xl p-6 h-full flex items-center justify-center overflow-hidden">
                <div className="grid gap-4 w-full max-w-md">
                  <div className="text-center mb-4">
                    <h3 className="text-xl font-semibold">暗記カード例</h3>
                  </div>
                  <div className="bg-muted p-4 rounded-lg">
                    <p className="text-lg font-medium mb-1">表: Memorize</p>
                    <p className="text-sm text-muted-foreground">
                      タップして答えを見る
                    </p>
                  </div>
                  <div className="bg-muted/50 p-4 rounded-lg">
                    <p className="text-lg font-medium mb-1">
                      裏: 記憶する、暗記する
                    </p>
                    <p className="text-sm text-muted-foreground">
                      記憶に定着させる意味の動詞
                    </p>
                  </div>
                  <div className="flex justify-between">
                    <Button
                      variant="outline"
                      size="sm"
                      aria-label="次のカードへ"
                    >
                      次のカード
                    </Button>
                    <Button size="sm" aria-label="このカードを覚えたとマーク">
                      覚えた
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
