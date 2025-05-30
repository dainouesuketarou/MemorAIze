import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Check } from 'lucide-react';
import Link from 'next/link';

export function LandingPricing() {
  return (
    <section
      className="py-16 md:py-24 bg-muted/50 w-full"
      id="pricing"
      aria-labelledby="pricing-heading"
    >
      <div className="w-full px-4 md:px-6 lg:px-8">
        <div className="flex flex-col items-center justify-center space-y-4 text-center max-w-[1400px] mx-auto">
          <div className="space-y-2">
            <div className="inline-block rounded-lg bg-muted px-3 py-1 text-sm">
              料金プラン
            </div>
            <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
              あなたの学習ニーズに合わせたプラン
            </h2>
            <p className="max-w-[700px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
              無料プランから始めて、必要に応じてアップグレードできます。
            </p>
          </div>
        </div>
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3 mt-16 max-w-[1400px] mx-auto">
          <Card className="flex flex-col justify-between">
            <CardHeader>
              <CardTitle className="text-2xl">無料プラン</CardTitle>
              <CardDescription>
                基本的な機能を利用できる無料プラン
              </CardDescription>
              <div className="mt-4 text-4xl font-bold">
                ¥0
                <span className="text-muted-foreground font-normal text-sm">
                  /月
                </span>
              </div>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center">
                  <Check className="mr-2 h-4 w-4 text-primary" />
                  <span>基本的な暗記帳機能</span>
                </li>
                <li className="flex items-center">
                  <Check className="mr-2 h-4 w-4 text-primary" />
                  <span>月5回までのAI生成</span>
                </li>
                <li className="flex items-center">
                  <Check className="mr-2 h-4 w-4 text-primary" />
                  <span>暗記推移の可視化</span>
                </li>
                <li className="flex items-center">
                  <Check className="mr-2 h-4 w-4 text-primary" />
                  <span>カスタムグループ化</span>
                </li>
              </ul>
            </CardContent>
            <CardFooter></CardFooter>
          </Card>
          <Card className="flex flex-col justify-between border-primary">
            <CardHeader>
              <div className="inline-block rounded-lg bg-primary px-3 py-1 text-sm text-primary-foreground">
                人気
              </div>
              <CardTitle className="mt-4 text-2xl">プロプラン</CardTitle>
              <CardDescription>より高度な機能を利用するプラン</CardDescription>
              <div className="mt-4 text-4xl font-bold">
                ¥500
                <span className="text-muted-foreground font-normal text-sm">
                  /月
                </span>
              </div>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center">
                  <Check className="mr-2 h-4 w-4 text-primary" />
                  <span>無料プランの全機能</span>
                </li>
                <li className="flex items-center">
                  <Check className="mr-2 h-4 w-4 text-primary" />
                  <span>無制限のAI生成</span>
                </li>
                <li className="flex items-center">
                  <Check className="mr-2 h-4 w-4 text-primary" />
                  <span>暗記帳のインポート機能</span>
                </li>
                <li className="flex items-center">
                  <Check className="mr-2 h-4 w-4 text-primary" />
                  <span>広告なしの快適な環境</span>
                </li>
              </ul>
            </CardContent>
            <CardFooter></CardFooter>
          </Card>
          <Card className="flex flex-col justify-between">
            <CardHeader>
              <CardTitle className="text-2xl">プロ（年間プラン）</CardTitle>
              <CardDescription>年間契約でお得になるプラン</CardDescription>
              <div className="mt-4 text-4xl font-bold">
                ¥400
                <span className="text-muted-foreground font-normal text-sm">
                  /月
                </span>
              </div>
              <p className="text-sm text-muted-foreground">
                年間払い（¥4,800）で2ヶ月分お得
              </p>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center">
                  <Check className="mr-2 h-4 w-4 text-primary" />
                  <span>プロプランの全機能</span>
                </li>
                <li className="flex items-center">
                  <Check className="mr-2 h-4 w-4 text-primary" />
                  <span>年間契約によるお得な料金</span>
                </li>
              </ul>
            </CardContent>
            <CardFooter></CardFooter>
          </Card>
        </div>
      </div>
    </section>
  );
}
