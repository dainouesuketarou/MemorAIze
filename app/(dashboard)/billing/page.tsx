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
import { useSubscription } from '@/hooks/use-subscription';
import { SubscriptionStatus, SubscriptionPlan } from '@prisma/client';
import { Loading } from '@/components/loading';

export default function BillingPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const subscription = useSubscription();
  const [isLoading, setIsLoading] = useState(true);
  const dispatch = useDispatch();

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

  const handleCancel = async () => {
    if (!subscription) return;

    try {
      const response = await fetch('/api/subscription/cancel', {
        method: 'POST',
      });

      const data = await response.json();

      if (!response.ok) {
        if (data.error?.includes('incomplete')) {
          toast.error(
            '支払いが完了していないため、キャンセルできません。支払いを完了してください。',
          );
          return;
        }
        throw new Error(
          data.error || 'サブスクリプションのキャンセルに失敗しました',
        );
      }

      toast.success(data.message || 'サブスクリプションをキャンセルしました');

      const updatedSubscription = {
        status: 'CANCELED' as SubscriptionStatus,
        plan: subscription.plan,
        stripeSubscriptionId: subscription.stripeSubscriptionId,
        stripePriceId: subscription.stripePriceId,
        stripeCurrentPeriodEnd: data.currentPeriodEnd
          ? new Date(data.currentPeriodEnd)
          : null,
      };

      dispatch(setSubscription(updatedSubscription));
    } catch (error) {
      console.error('Cancel error:', error);
      if (error instanceof Error) {
        if (error.message.includes('incomplete')) {
          toast.error(
            '支払いが完了していないため、キャンセルできません。支払いを完了してください。',
          );
        } else {
          toast.error(error.message);
        }
      } else {
        toast.error('サブスクリプションのキャンセルに失敗しました');
      }
    }
  };

  const formatDate = (dateString: string | Date | null | undefined) => {
    if (!dateString) return 'なし';
    const date =
      typeof dateString === 'string' ? new Date(dateString) : dateString;
    return date.toLocaleDateString('ja-JP');
  };

  const getSubscriptionEndDate = (date: Date | null) => {
    if (!date) return 'なし';
    const endDate = new Date(date);
    endDate.setDate(endDate.getDate() - 1); // 前日を計算
    return endDate.toLocaleDateString('ja-JP');
  };

  if (isLoading || status === 'loading') {
    return <Loading />;
  }

  const isProPlan =
    subscription?.plan === 'PRO_MONTHLY' || subscription?.plan === 'PRO_YEARLY';
  const canCancel = isProPlan && subscription?.status === 'ACTIVE';

  return (
    <div className="min-h-screen bg-primary/5">
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
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
                          subscription?.stripeCurrentPeriodEnd,
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
              <Button
                variant="outline"
                onClick={() => router.push('/subscription')}
              >
                プランを変更
              </Button>
              {canCancel && (
                <Button variant="destructive" onClick={handleCancel}>
                  Freeに戻る
                </Button>
              )}
            </CardFooter>
          </Card>
        </div>
      </main>
    </div>
  );
}
