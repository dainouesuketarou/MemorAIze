'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/src/components/ui/card';
import { Button } from '@/src/components/ui/button';
import { Separator } from '@/src/components/ui/separator';
import { toast } from 'sonner';
import { format } from 'date-fns'; // format は使用されていませんが残しておきます
import { ja } from 'date-fns/locale'; // ja も使用されていませんが残しておきます
import {
  ChevronLeft,
  Settings,
  CreditCard,
  FileText,
  BarChart,
  Bell,
  Plus,
  Trash2,
  Check,
} from 'lucide-react';
import { useDispatch } from 'react-redux';
import { setSubscription } from '@/src/lib/store/slices/userSlice';
import { useSubscription } from '@/src/hooks/use-subscription';
import { SubscriptionStatus, SubscriptionPlan } from '@prisma/client';
import { Loading } from '@/src/components/loading';
import { HeaderNav } from '@/src/components/dashboard/header-nav';

export default function BillingPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { subscription, isLoading: isSubscriptionLoading } = useSubscription();
  const [isLoading, setIsLoading] = useState(true);
  const dispatch = useDispatch();

  // HeaderNav用のstate
  const [groupMode, setGroupMode] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // スクロールイベント
  useEffect(() => {
    let ticking = false;
    const onScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          setScrolled(window.scrollY > 10);
          ticking = false;
        });
        ticking = true;
      }
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  useEffect(() => {
    if (subscription !== undefined) {
      setIsLoading(false);
    }
  }, [subscription]);

  const handleManageSubscription = async () => {
    try {
      const response = await fetch('/api/subscription/portal', {
        method: 'POST',
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 404) {
          toast.error(
            'Stripeの顧客情報が見つかりません。サポートにお問い合わせください。',
          );
          return;
        }
        if (response.status === 401) {
          toast.error('認証が必要です。再度ログインしてください。');
          return;
        }
        if (response.status === 400) {
          toast.error(data.error || 'Stripeの処理に失敗しました');
          return;
        }
        throw new Error(
          data.error ||
            data.details ||
            'ポータルセッションの作成に失敗しました',
        );
      }

      if (!data.url) {
        throw new Error('ポータルURLが取得できませんでした');
      }

      window.location.href = data.url;
    } catch (error) {
      console.error('Portal session error:', error);
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error('サブスクリプション管理ページへの遷移に失敗しました');
      }
    }
  };

  const formatDate = (dateString: string | Date | null | undefined) => {
    if (!dateString) return 'なし';
    const date =
      typeof dateString === 'string' ? new Date(dateString) : dateString;
    // 日本時間に変換
    const jpDate = new Date(date.getTime() + 9 * 60 * 60 * 1000);
    return jpDate.toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      timeZone: 'Asia/Tokyo',
    });
  };

  const getSubscriptionEndDate = (date: Date | null) => {
    if (!date) return 'なし';
    // 日本時間に変換
    const jpDate = new Date(date.getTime() + 9 * 60 * 60 * 1000);
    jpDate.setDate(jpDate.getDate() - 1); // 前日を計算
    return jpDate.toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      timeZone: 'Asia/Tokyo',
    });
  };

  // subscription?.stripeCurrentPeriodEnd を Dateオブジェクトに変換するヘルパー関数
  const getPeriodEndAsDate = (
    dateString: string | null | undefined,
  ): Date | null => {
    if (!dateString) return null;
    try {
      const date = new Date(dateString);
      // 無効な日付の場合はnullを返す
      if (isNaN(date.getTime())) {
        console.warn('Invalid date string for conversion:', dateString);
        return null;
      }
      // 日本時間に変換
      return new Date(date.getTime() + 9 * 60 * 60 * 1000);
    } catch (error) {
      console.error(
        'Error converting date string to Date object:',
        dateString,
        error,
      );
      return null;
    }
  };

  if (isLoading || isSubscriptionLoading || status === 'loading') {
    return (
      <div className="min-h-screen flex flex-col">
        <HeaderNav
          groupMode={groupMode}
          setGroupMode={setGroupMode}
          scrolled={scrolled}
        />
        <main className="flex-1 flex items-center justify-center">
          <Loading />
        </main>
      </div>
    );
  }

  const isProPlan =
    subscription?.plan === 'PRO_MONTHLY' || subscription?.plan === 'PRO_YEARLY';

  return (
    <div className="min-h-screen flex flex-col">
      <HeaderNav
        groupMode={groupMode}
        setGroupMode={setGroupMode}
        scrolled={scrolled}
      />
      <main className="flex-1">
        {/* Header */}
        <header className="shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-6">
              <div className="flex items-center">
                <button
                  onClick={() => router.back()}
                  className="text-gray-500 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 mr-4"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <h1 className="text-2xl font-bold">課金情報</h1>
              </div>
            </div>
          </div>
        </header>

        {/* Main content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="max-w-2xl mx-auto">
            <Card>
              <CardHeader>
                <CardTitle>現在のプラン</CardTitle>
                <CardDescription>
                  {subscription?.plan === 'PRO_MONTHLY'
                    ? 'プロプラン（月額）'
                    : subscription?.plan === 'PRO_YEARLY'
                    ? 'プロプラン（年額）'
                    : '無料プラン'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">ステータス</span>
                    <span className="font-medium">
                      {subscription?.status === 'ACTIVE'
                        ? '有効'
                        : subscription?.status === 'CANCELED'
                        ? 'キャンセル済み'
                        : subscription?.status === 'PAST_DUE'
                        ? '支払い期限切れ'
                        : subscription?.status === 'TRIALING'
                        ? 'トライアル中'
                        : '無効'}
                    </span>
                  </div>
                  <Separator />
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">
                      {subscription?.status === 'CANCELED'
                        ? '利用可能期限'
                        : '次回請求日'}
                    </span>
                    <span className="font-medium">
                      {subscription?.status === 'CANCELED'
                        ? getSubscriptionEndDate(
                            // ここでDateオブジェクトに変換して渡す
                            getPeriodEndAsDate(
                              subscription?.stripeCurrentPeriodEnd,
                            ),
                          )
                        : formatDate(subscription?.stripeCurrentPeriodEnd)}
                    </span>
                  </div>
                  {subscription?.status === 'CANCELED' && (
                    <div className="text-sm text-muted-foreground">
                      現在のプランは
                      {formatDate(subscription?.stripeCurrentPeriodEnd)}
                      まで利用可能です
                    </div>
                  )}
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                {isProPlan ? (
                  <Button onClick={handleManageSubscription}>
                    サブスクリプションを管理
                  </Button>
                ) : (
                  <Button onClick={() => router.push('/subscription')}>
                    アップグレード
                  </Button>
                )}
              </CardFooter>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
