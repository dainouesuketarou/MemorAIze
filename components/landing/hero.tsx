import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Link from 'next/link';
import { BrainCircuit } from 'lucide-react';

export function LandingHero() {
  return (
    <div className="bg-gradient-to-b from-muted/50 to-muted pb-16 pt-10">
      <div className="container px-4 md:px-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BrainCircuit className="h-8 w-8 text-primary" />
            <h1 className="text-2xl font-bold">MemorAIze</h1>
          </div>
          <div>
            <Link href="/login">
              <Button>ログイン / 登録</Button>
            </Link>
          </div>
        </div>
        
        <div className="grid gap-6 lg:grid-cols-2 lg:gap-12 mt-16 items-center">
          <div className="flex flex-col justify-center space-y-4">
            <div className="space-y-2">
              <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                AIを使って効率的に
                <span className="text-primary"> 暗記学習</span>
              </h1>
              <p className="max-w-[600px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                PDFや画像をアップロードするだけで、AIが最適な暗記カードを生成。
                効率的な学習で記憶の定着を最大化します。
              </p>
            </div>
            <div className="flex flex-col gap-2 min-[400px]:flex-row">
              <Link href="/login" className="w-full md:w-auto">
                <Button size="lg" className="w-full">
                  はじめる
                </Button>
              </Link>
              <Link href="#features" className="w-full md:w-auto">
                <Button size="lg" variant="outline" className="w-full">
                  機能を見る
                </Button>
              </Link>
            </div>
          </div>
          <div className="flex justify-center">
            <div className="relative w-full max-w-[500px] aspect-square">
              <div className="absolute w-full h-full bg-gradient-to-br from-purple-500/20 to-indigo-500/20 rounded-3xl transform -rotate-6 scale-95"></div>
              <div className="relative bg-white shadow-lg rounded-3xl p-6 h-full flex items-center justify-center overflow-hidden">
                <div className="grid gap-4 w-full max-w-md">
                  <div className="text-center mb-4">
                    <h3 className="text-xl font-semibold">暗記カード例</h3>
                  </div>
                  <div className="bg-muted p-4 rounded-lg">
                    <p className="text-lg font-medium mb-1">表: Memorize</p>
                    <p className="text-sm text-muted-foreground">タップして答えを見る</p>
                  </div>
                  <div className="bg-muted/50 p-4 rounded-lg">
                    <p className="text-lg font-medium mb-1">裏: 記憶する、暗記する</p>
                    <p className="text-sm text-muted-foreground">記憶に定着させる意味の動詞</p>
                  </div>
                  <div className="flex justify-between">
                    <Button variant="outline" size="sm">
                      次のカード
                    </Button>
                    <Button size="sm">
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