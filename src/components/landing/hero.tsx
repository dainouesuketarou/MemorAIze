'use client';

import { Button } from '@/src/components/ui/button';
import { Input } from '@/src/components/ui/input';
import Link from 'next/link';
import Image from 'next/image';
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
            <Image
              src="/logo.png"
              alt="MemorAIze"
              width={64}
              height={64}
              className="h-16 w-16 text-primary"
            />
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
          <div className="flex justify-center" aria-label="AI機能のデモ">
            <div className="relative w-full max-w-[500px] h-auto min-h-[420px] lg:aspect-square">
              <div
                className="absolute w-full h-full bg-gradient-to-br from-purple-500/20 to-indigo-500/20 rounded-3xl transform -rotate-6 scale-95"
                aria-hidden="true"
              ></div>
              <div className="relative bg-white shadow-lg rounded-3xl p-6 h-full flex items-center justify-center overflow-hidden">
                <div className="grid gap-4 w-full max-w-md">
                  <div className="text-center mb-4">
                    <h3 className="text-xl font-semibold text-primary">
                      AIによる暗記カード生成
                    </h3>
                  </div>

                  {/* 入力ファイル表示エリア */}
                  <div className="bg-muted p-4 rounded-lg border-2 border-dashed border-primary/20">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="bg-primary/10 p-2 rounded">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="24"
                          height="24"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="text-primary"
                        >
                          <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
                          <polyline points="14 2 14 8 20 8" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-sm font-medium">教材ファイル</p>
                        <p className="text-xs text-muted-foreground">
                          PDF, 画像, テキスト
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* AI処理アニメーション */}
                  <div className="flex items-center justify-center gap-2 text-primary">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
                    <span className="text-sm">
                      AIが最適な暗記カードを生成中...
                    </span>
                  </div>

                  {/* 生成されたカード */}
                  <div className="bg-muted/50 p-4 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <BrainCircuit className="h-4 w-4 text-primary" />
                      <p className="text-sm font-medium">AI生成カード</p>
                    </div>
                    <div className="space-y-2">
                      <div className="bg-white/50 p-2 rounded">
                        <p className="text-sm font-medium">表: 光合成の定義</p>
                      </div>
                      <div className="bg-white/50 p-2 rounded">
                        <p className="text-sm font-medium">
                          裏:
                          植物が光エネルギーを使って二酸化炭素と水から有機物を合成する過程
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-between">
                    <Button
                      variant="outline"
                      size="sm"
                      className="gap-2"
                      aria-label="カードを編集"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
                      </svg>
                      編集
                    </Button>
                    <Button
                      size="sm"
                      className="gap-2"
                      aria-label="カードを保存"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
                        <polyline points="17 21 17 13 7 13 7 21" />
                        <polyline points="7 3 7 8 15 8" />
                      </svg>
                      保存
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
