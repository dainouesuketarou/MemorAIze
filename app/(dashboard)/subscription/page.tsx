'use client';

import { Check, Sparkles, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import Image from 'next/image';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { loadStripe } from '@stripe/stripe-js';
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js';
import { STRIPE_PRICE_IDS } from '@/lib/stripe';

// Stripeの公開キーを初期化
const stripePublishableKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
if (!stripePublishableKey) {
  throw new Error('NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY is not set');
}

const stripePromise = loadStripe(stripePublishableKey);

interface Plan {
  id: string;
  name: string;
  description: string;
  price: number;
  interval: 'month' | 'year';
  features: string[];
  isPopular?: boolean;
  stripePriceId: string;
}

const plans: Plan[] = [
  {
    id: 'free',
    name: 'Free',
    description: '基本的な機能を無料でお使いいただけます',
    price: 0,
    interval: 'month',
    features: [
      'AI生成機能（月5回まで）',
      '基本的な学習機能',
      'デッキの作成と管理',
    ],
    stripePriceId: STRIPE_PRICE_IDS.FREE!,
  },
  {
    id: 'pro-monthly',
    name: 'Pro',
    description: 'すべての機能を無制限でお使いいただけます',
    price: 500,
    interval: 'month',
    features: [
      'AI生成機能（無制限）',
      'すべての学習機能',
      'デッキの共有とインポート',
      '優先サポート',
    ],
    isPopular: true,
    stripePriceId: STRIPE_PRICE_IDS.PRO_MONTHLY!,
  },
  {
    id: 'pro-yearly',
    name: 'Pro（年間）',
    description: '年間プランでお得にご利用いただけます',
    price: 4800,
    interval: 'year',
    features: [
      'AI生成機能（無制限）',
      'すべての学習機能',
      'デッキの共有とインポート',
      '優先サポート',
      '年間プラン特別価格',
    ],
    stripePriceId: STRIPE_PRICE_IDS.PRO_YEARLY!,
  },
];

function CheckoutForm({
  planId,
  onSuccess,
}: {
  planId: string;
  onSuccess: () => void;
}) {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setLoading(true);
    try {
      const { error } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/subscription/success`,
        },
      });

      if (error) {
        throw new Error(error.message);
      }

      onSuccess();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : 'エラーが発生しました',
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <PaymentElement />
      <Button type="submit" disabled={!stripe || loading} className="w-full">
        {loading ? '処理中...' : '支払いを確定'}
      </Button>
    </form>
  );
}

export default function SubscriptionPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null);
  const [subscription, setSubscription] = useState<any>(null);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  useEffect(() => {
    const fetchSubscription = async () => {
      try {
        const response = await fetch('/api/subscription');
        if (response.ok) {
          const data = await response.json();
          setSubscription(data);
        }
      } catch (error) {
        console.error('サブスクリプション情報の取得に失敗しました:', error);
      }
    };

    if (session?.user) {
      fetchSubscription();
    }
  }, [session]);

  const handleUpgrade = async (planId: string) => {
    if (!session?.user) {
      toast.error('ログインが必要です');
      router.push('/login');
      return;
    }

    const plan = plans.find((p) => p.id === planId);
    if (!plan) {
      toast.error('無効なプランです');
      return;
    }

    // 現在のプランと同じ場合は何もしない
    if (subscription?.plan === plan.stripePriceId) {
      toast.info('現在のプランと同じです');
      return;
    }

    setLoading(planId);
    try {
      const response = await fetch('/api/subscription', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          priceId: plan.stripePriceId,
        }),
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(error || 'サブスクリプションの作成に失敗しました');
      }

      const { clientSecret } = await response.json();
      setClientSecret(clientSecret);
      setSelectedPlanId(planId);
    } catch (error) {
      console.error('Subscription error:', error);
      toast.error(
        error instanceof Error ? error.message : 'エラーが発生しました',
      );
    } finally {
      setLoading(null);
    }
  };

  const getCurrentPlan = () => {
    if (!subscription) return 'free';
    switch (subscription.plan) {
      case STRIPE_PRICE_IDS.PRO_MONTHLY:
        return 'pro-monthly';
      case STRIPE_PRICE_IDS.PRO_YEARLY:
        return 'pro-yearly';
      default:
        return 'free';
    }
  };

  const currentPlanId = getCurrentPlan();

  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="container max-w-7xl mx-auto px-4 py-8">
      <div className="mb-8">
        <Button
          variant="ghost"
          className="gap-2"
          onClick={() => router.push('/dashboard')}
        >
          <ArrowLeft className="h-4 w-4" />
          ダッシュボードに戻る
        </Button>
      </div>

      <div className="text-center mb-12">
        <div className="flex items-center justify-center mb-4">
          <Image
            src="/logo.png"
            alt="MemorAIze"
            width={64}
            height={64}
            className="h-16 w-16 text-primary"
          />
          <h1 className="text-3xl font-bold">MemorAIze</h1>
        </div>
        <h2 className="text-4xl font-bold mb-4">プラン選択</h2>
        <p className="text-xl text-muted-foreground">
          あなたの学習をサポートする最適なプランをお選びください
        </p>
        {subscription && (
          <p className="mt-2 text-sm text-muted-foreground">
            現在のプラン: {plans.find((p) => p.id === currentPlanId)?.name}
            {subscription.stripeCurrentPeriodEnd && (
              <span className="ml-2">
                (次回更新日:{' '}
                {new Date(
                  subscription.stripeCurrentPeriodEnd,
                ).toLocaleDateString('ja-JP')}
                )
              </span>
            )}
          </p>
        )}
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        {plans.map((plan) => {
          const isCurrentPlan = plan.id === currentPlanId;
          return (
            <Card
              key={plan.id}
              className={cn(
                'flex flex-col',
                plan.isPopular && 'border-primary shadow-lg',
                isCurrentPlan && 'border-2 border-primary',
              )}
            >
              <CardHeader>
                <CardTitle className="text-2xl">{plan.name}</CardTitle>
                <CardDescription>{plan.description}</CardDescription>
              </CardHeader>
              <CardContent className="flex-grow">
                <div className="mb-6">
                  <span className="text-4xl font-bold">
                    ¥{plan.price.toLocaleString()}
                  </span>
                  <span className="text-muted-foreground">
                    /{plan.interval === 'month' ? '月' : '年'}
                  </span>
                </div>
                <ul className="space-y-3">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-center">
                      <Check className="h-5 w-5 text-primary mr-2" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter>
                <Button
                  className="w-full gap-2"
                  variant={
                    isCurrentPlan
                      ? 'default'
                      : plan.isPopular
                      ? 'default'
                      : 'outline'
                  }
                  onClick={() => handleUpgrade(plan.id)}
                  disabled={loading === plan.id || isCurrentPlan}
                >
                  {loading === plan.id ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
                      処理中...
                    </>
                  ) : isCurrentPlan ? (
                    '現在のプラン'
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4" />
                      アップグレード
                    </>
                  )}
                </Button>
              </CardFooter>
            </Card>
          );
        })}
      </div>

      {clientSecret && selectedPlanId && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>支払い情報の入力</CardTitle>
              <CardDescription>
                選択したプラン:{' '}
                {plans.find((p) => p.id === selectedPlanId)?.name}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Elements
                stripe={stripePromise}
                options={{
                  clientSecret,
                  appearance: {
                    theme: 'stripe',
                  },
                }}
              >
                <CheckoutForm
                  planId={selectedPlanId}
                  onSuccess={() => {
                    setClientSecret(null);
                    setSelectedPlanId(null);
                    router.refresh();
                  }}
                />
              </Elements>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
