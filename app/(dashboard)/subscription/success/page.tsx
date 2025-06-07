'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, CheckCircle2, XCircle } from 'lucide-react';
import { toast } from 'sonner';
import { useDispatch } from 'react-redux';
import { setSubscription } from '@/lib/store/slices/userSlice';
import { SubscriptionStatus, SubscriptionPlan } from '@prisma/client';

// userSlice.ts の Subscription インターフェースと一致させる
interface Subscription {
  status: SubscriptionStatus;
  plan: SubscriptionPlan;
  stripeSubscriptionId: string | null;
  stripePriceId: string | null;
  // ここを Date | null から string | null に変更
  stripeCurrentPeriodEnd: string | null;
  // 必要に応じて他のプロパティも追加
  cancelAtPeriodEnd?: boolean;
}

export default function SubscriptionSuccessPage() {
  const router = useRouter();
  const dispatch = useDispatch();
  const searchParams = useSearchParams();
  const [isVerifying, setIsVerifying] = useState(true);
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    const verifyPayment = async () => {
      try {
        const paymentIntent = searchParams.get('payment_intent');
        const paymentIntentClientSecret = searchParams.get(
          'payment_intent_client_secret',
        );
        const redirectStatus = searchParams.get('redirect_status');

        if (!paymentIntent || !paymentIntentClientSecret) {
          setIsSuccess(false);
          toast.error('支払い情報が見つかりません');
          setIsVerifying(false); // エラーの場合も検証を終了
          return;
        }

        // ★ verify エンドポイントへの呼び出し
        const response = await fetch('/api/subscription/verify', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            paymentIntent,
            paymentIntentClientSecret,
            redirectStatus,
          }),
        });

        if (!response.ok) {
          const errorText = await response.text(); // text() を使ってエラーメッセージを取得
          let errorMessage = '支払いの確認に失敗しました';
          try {
            const errorJson = JSON.parse(errorText);
            errorMessage = errorJson.message || errorMessage;
          } catch {
            errorMessage = errorText || errorMessage;
          }
          throw new Error(errorMessage);
        }

        // verify エンドポイントが成功したと判断されたら、
        // /api/subscription/status から最新のサブスクリプション情報を取得
        const subscriptionResponse = await fetch('/api/subscription/status');
        if (!subscriptionResponse.ok) {
          throw new Error('サブスクリプション情報の取得に失敗しました');
        }

        const subscriptionData: Subscription = // 型を一致させる
          await subscriptionResponse.json();

        // Reduxの状態を更新 - ここでの更新は「最終確認」としての更新
        dispatch(setSubscription(subscriptionData));

        setIsSuccess(true);
        toast.success('サブスクリプションの登録が完了しました');
      } catch (error) {
        console.error('Payment verification error:', error);
        setIsSuccess(false);
        toast.error(
          error instanceof Error ? error.message : '支払いの確認に失敗しました',
        );
      } finally {
        setIsVerifying(false);
      }
    };

    verifyPayment();
  }, [searchParams, dispatch]); // dispatch を依存配列に含める

  const handleBackToDashboard = () => {
    router.push('/dashboard');
  };

  if (isVerifying) {
    return (
      <div className="container max-w-2xl mx-auto px-4 py-8">
        <Card>
          <CardHeader>
            <CardTitle className="text-center">支払いを確認中...</CardTitle>
          </CardHeader>
          <CardContent className="flex justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container max-w-2xl mx-auto px-4 py-8">
      <Card>
        <CardHeader>
          <CardTitle className="text-center">
            {isSuccess ? '支払い完了' : '支払いエラー'}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex justify-center">
            {isSuccess ? (
              <CheckCircle2 className="h-16 w-16 text-green-500" />
            ) : (
              <XCircle className="h-16 w-16 text-red-500" />
            )}
          </div>
          <p className="text-center text-lg">
            {isSuccess
              ? 'サブスクリプションの登録が完了しました'
              : '支払いの処理中にエラーが発生しました'}
          </p>
          <div className="flex justify-center">
            <Button
              variant="outline"
              className="gap-2"
              onClick={handleBackToDashboard}
            >
              <ArrowLeft className="h-4 w-4" />
              ダッシュボードに戻る
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
