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
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { ja } from 'date-fns/locale';
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
import { setSubscription } from '@/lib/store/slices/userSlice';
import { SubscriptionStatus, SubscriptionPlan } from '@prisma/client';

interface Subscription {
  id: string;
  plan: SubscriptionPlan;
  status: SubscriptionStatus;
  stripeSubscriptionId: string | null;
  stripePriceId: string | null;
  stripeCurrentPeriodEnd: Date | null;
  cancelAtPeriodEnd: boolean;
}

type PaymentMethod = {
  id: string;
  brand: string;
  last4: string;
  expMonth: number;
  expYear: number;
  isDefault: boolean;
};

export default function BillingPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [subscription, setSubscriptionState] = useState<Subscription | null>(
    null,
  );
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [isLoadingPaymentMethods, setIsLoadingPaymentMethods] = useState(false);
  const dispatch = useDispatch();

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  useEffect(() => {
    const fetchSubscription = async () => {
      try {
        const response = await fetch('/api/subscription');
        if (!response.ok) {
          throw new Error('サブスクリプション情報の取得に失敗しました');
        }
        const data = await response.json();
        setSubscriptionState(data);
        dispatch(setSubscription(data));
      } catch (error) {
        console.error('Error fetching subscription:', error);
        toast.error('サブスクリプション情報の取得に失敗しました');
      } finally {
        setIsLoading(false);
      }
    };

    if (session?.user) {
      fetchSubscription();
    }
  }, [session, dispatch]);

  useEffect(() => {
    const fetchPaymentMethods = async () => {
      if (activeTab === 'payment') {
        setIsLoadingPaymentMethods(true);
        try {
          const response = await fetch('/api/subscription/payment-methods');
          const data = await response.json();
          setPaymentMethods(data.paymentMethods);
        } catch (error) {
          toast.error('支払い方法の取得に失敗しました');
        } finally {
          setIsLoadingPaymentMethods(false);
        }
      }
    };

    fetchPaymentMethods();
  }, [activeTab]);

  const handleUpgrade = async () => {
    try {
      const response = await fetch('/api/subscription', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          priceId: process.env.NEXT_PUBLIC_STRIPE_PRO_PRICE_ID,
        }),
      });

      const { subscriptionId, clientSecret } = await response.json();
      // Stripeの決済ページにリダイレクト
      window.location.href = `/payment?subscriptionId=${subscriptionId}&clientSecret=${clientSecret}`;
    } catch (error) {
      toast.error('決済ページへの遷移に失敗しました');
    }
  };

  const handleCancel = async () => {
    if (!subscription) return;

    try {
      const response = await fetch('/api/subscription/cancel', {
        method: 'POST',
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || 'サブスクリプションのキャンセルに失敗しました',
        );
      }

      toast.success(data.message);

      // サブスクリプション情報を更新
      const updatedSubscription: Subscription = {
        ...subscription,
        status: 'CANCELED',
        cancelAtPeriodEnd: true,
        stripeCurrentPeriodEnd: data.currentPeriodEnd
          ? new Date(data.currentPeriodEnd)
          : null,
      };

      setSubscriptionState(updatedSubscription);
      dispatch(setSubscription(updatedSubscription));
    } catch (error) {
      console.error('Cancel error:', error);
      toast.error(
        error instanceof Error
          ? error.message
          : 'サブスクリプションのキャンセルに失敗しました',
      );
    }
  };

  const formatCardNumber = (last4: string) => `**** **** **** ${last4}`;
  const formatExpiryDate = (month: number, year: number) =>
    `${month.toString().padStart(2, '0')}/${year.toString().slice(-2)}`;

  const renderPaymentMethods = () => {
    if (isLoadingPaymentMethods) {
      return (
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      );
    }

    if (paymentMethods.length === 0) {
      return (
        <div className="text-center py-8">
          <p className="text-muted-foreground">
            登録されている支払い方法はありません
          </p>
          <Button className="mt-4" variant="outline">
            <Plus className="w-4 h-4 mr-2" />
            支払い方法を追加
          </Button>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        {paymentMethods.map((method) => (
          <div
            key={method.id}
            className="flex items-center justify-between p-4 border rounded-lg"
          >
            <div className="flex items-center space-x-4">
              <CreditCard className="w-6 h-6 text-muted-foreground" />
              <div>
                <p className="font-medium">
                  {method.brand.charAt(0).toUpperCase() + method.brand.slice(1)}{' '}
                  {formatCardNumber(method.last4)}
                </p>
                <p className="text-sm text-muted-foreground">
                  有効期限: {formatExpiryDate(method.expMonth, method.expYear)}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              {method.isDefault && (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  <Check className="w-3 h-3 mr-1" />
                  デフォルト
                </span>
              )}
              <Button
                variant="ghost"
                size="icon"
                className="text-red-500 hover:text-red-600"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </div>
        ))}
        <Button className="w-full mt-4" variant="outline">
          <Plus className="w-4 h-4 mr-2" />
          支払い方法を追加
        </Button>
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  const isProPlan =
    subscription?.plan === 'PRO_MONTHLY' || subscription?.plan === 'PRO_YEARLY';
  const canCancel =
    isProPlan &&
    subscription?.status === 'ACTIVE' &&
    !subscription?.cancelAtPeriodEnd;

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <div className="space-y-6">
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
                    <span className="text-muted-foreground">次回請求日</span>
                    <span className="font-medium">
                      {subscription?.stripeCurrentPeriodEnd
                        ? subscription.stripeCurrentPeriodEnd.toLocaleDateString(
                            'ja-JP',
                          )
                        : 'なし'}
                    </span>
                  </div>
                  {subscription?.cancelAtPeriodEnd && (
                    <>
                      <Separator />
                      <div className="text-sm text-muted-foreground">
                        現在のプランは期間終了時にキャンセルされます
                      </div>
                      <div className="text-sm text-muted-foreground">
                        プロプランは{' '}
                        {subscription.stripeCurrentPeriodEnd
                          ? format(
                              subscription.stripeCurrentPeriodEnd,
                              'yyyy年MM月dd日',
                              {
                                locale: ja,
                              },
                            )
                          : 'なし'}{' '}
                        まで利用可能です
                      </div>
                    </>
                  )}
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button
                  variant="outline"
                  onClick={() => router.push('/billing/upgrade')}
                >
                  プランを変更
                </Button>
                {canCancel && (
                  <Button variant="destructive" onClick={handleCancel}>
                    キャンセル
                  </Button>
                )}
              </CardFooter>
            </Card>
          </div>
        );
      case 'payment':
        return (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>支払い方法</CardTitle>
                <CardDescription>
                  現在の支払い方法を管理できます
                </CardDescription>
              </CardHeader>
              <CardContent>{renderPaymentMethods()}</CardContent>
            </Card>
          </div>
        );
      case 'usage':
        return (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>利用状況</CardTitle>
                <CardDescription>
                  プランの利用状況を確認できます
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-sm text-muted-foreground">
                  利用状況の表示機能は現在開発中です
                </div>
              </CardContent>
            </Card>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <button
                onClick={() => router.back()}
                className="text-gray-500 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 mr-4"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <h1 className="text-2xl font-bold text-gray-900">課金情報</h1>
            </div>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Sidebar */}
          <div className="w-full md:w-64 flex-shrink-0">
            <nav className="bg-white shadow-sm rounded-lg overflow-hidden">
              <div className="px-4 py-5 border-b border-gray-200">
                <p className="text-sm font-medium text-gray-500">メニュー</p>
              </div>
              <div className="py-2">
                <button
                  className={`w-full flex items-center px-4 py-3 text-sm font-medium ${
                    activeTab === 'overview'
                      ? 'text-blue-600 bg-blue-50'
                      : 'text-gray-700 hover:text-blue-600 hover:bg-gray-50'
                  }`}
                  onClick={() => setActiveTab('overview')}
                >
                  <Settings className="w-5 h-5 mr-3" />
                  概要
                </button>
                <button
                  className={`w-full flex items-center px-4 py-3 text-sm font-medium ${
                    activeTab === 'payment'
                      ? 'text-blue-600 bg-blue-50'
                      : 'text-gray-700 hover:text-blue-600 hover:bg-gray-50'
                  }`}
                  onClick={() => setActiveTab('payment')}
                >
                  <CreditCard className="w-5 h-5 mr-3" />
                  支払い方法
                </button>
                <button
                  className={`w-full flex items-center px-4 py-3 text-sm font-medium ${
                    activeTab === 'usage'
                      ? 'text-blue-600 bg-blue-50'
                      : 'text-gray-700 hover:text-blue-600 hover:bg-gray-50'
                  }`}
                  onClick={() => setActiveTab('usage')}
                >
                  <BarChart className="w-5 h-5 mr-3" />
                  利用状況
                </button>
              </div>
            </nav>
          </div>

          {/* Main content */}
          <div className="flex-1">{renderTabContent()}</div>
        </div>
      </main>
    </div>
  );
}
