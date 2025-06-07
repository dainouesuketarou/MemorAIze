import React from 'react';
import { Award, Check, Lock } from 'lucide-react';
import { RootState } from '@/lib/store/store';
import { SubscriptionPlan } from '@prisma/client';
import { useRouter } from 'next/navigation';
import { useDispatch, useSelector } from 'react-redux';
import { useEffect, useState } from 'react';
import { Subscription } from '@prisma/client';
import { setSubscription } from '@/lib/store/slices/userSlice';
import { useSubscription } from '@/hooks/use-subscription';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface PlanFeatures {
  name: string;
  displayName: string;
  features: string[];
  color: string;
  bgColor: string;
  price: string;
  upgradeable: boolean;
}

const PLAN_FEATURES: Record<SubscriptionPlan, PlanFeatures> = {
  FREE: {
    name: 'FREE',
    displayName: '無料',
    features: ['最大10個のデッキ', '基本的な学習機能', '基本的な統計'],
    color: 'text-muted-foreground',
    bgColor: 'bg-muted',
    price: '¥0',
    upgradeable: true,
  },
  PRO_MONTHLY: {
    name: 'PRO_MONTHLY',
    displayName: 'プロ（月額）',
    features: [
      '無制限のデッキ',
      '高度な統計',
      'デッキの共有機能',
      '優先サポート',
    ],
    color: 'text-blue-500 dark:text-blue-400',
    bgColor: 'bg-blue-500/10 dark:bg-blue-400/10',
    price: '¥980/月',
    upgradeable: false,
  },
  PRO_YEARLY: {
    name: 'PRO_YEARLY',
    displayName: 'プロ（年額）',
    features: [
      '無制限のデッキ',
      '高度な統計',
      'デッキの共有機能',
      '優先サポート',
      '2ヶ月分お得',
    ],
    color: 'text-purple-500 dark:text-purple-400',
    bgColor: 'bg-purple-500/10 dark:bg-purple-400/10',
    price: '¥9,800/年',
    upgradeable: false,
  },
};

export const UserPlan: React.FC = () => {
  const router = useRouter();
  const { subscription, isLoading } = useSubscription();
  const dispatch = useDispatch();
  const currentPlan = subscription?.plan || 'FREE';
  const planFeatures = PLAN_FEATURES[currentPlan];

  // useEffect(() => {
  //   const fetchSubscription = async () => {
  //     try {
  //       // サブスクリプション情報を取得
  //       const subscriptionResponse = await fetch('/api/subscription/status');
  //       if (!subscriptionResponse.ok) {
  //         throw new Error('サブスクリプション情報の取得に失敗しました');
  //       }

  //       const subscriptionData: Subscription =
  //         await subscriptionResponse.json();

  //       // Reduxの状態を更新
  //       dispatch(setSubscription(subscriptionData));
  //     } catch (error) {
  //       console.error('サブスクリプション情報の取得に失敗しました:', error);
  //     }
  //   };
  //   fetchSubscription();
  // }, []);

  const handlePlanChange = () => {
    router.push('/subscription');
  };

  if (isLoading) {
    return (
      <div className="bg-card rounded-xl shadow-sm p-6 transition-all duration-300 hover:shadow-md border animate-pulse">
        <div className="h-6 w-1/3 bg-muted rounded mb-4"></div>
        <div className="h-4 w-1/4 bg-muted rounded mb-4"></div>
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-4 w-3/4 bg-muted rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card rounded-xl shadow-sm p-6 transition-all duration-300 hover:shadow-md border">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-foreground">現在のプラン</h2>
        <div
          className={cn(
            'py-1 px-3 rounded-full text-sm font-medium',
            planFeatures.color,
            planFeatures.bgColor,
          )}
        >
          {planFeatures.displayName}
        </div>
      </div>
      <div className="flex items-center mb-4">
        <div
          className={cn(
            'w-10 h-10 flex-shrink-0 rounded-full flex items-center justify-center',
            planFeatures.bgColor,
            planFeatures.color,
          )}
        >
          <Award size={20} />
        </div>
        <div className="ml-4">
          <p className="font-medium text-foreground">
            {planFeatures.displayName}プラン
          </p>
          <p className="text-sm text-muted-foreground">{planFeatures.price}</p>
        </div>
      </div>
      <div className="space-y-2 mt-4">
        {planFeatures.features.map((feature, index) => (
          <div key={index} className="flex items-start">
            <div className="text-green-500 dark:text-green-400 mt-0.5 mr-2">
              <Check size={16} />
            </div>
            <span className="text-muted-foreground text-sm">{feature}</span>
          </div>
        ))}
      </div>
      <div className="pt-4 mt-4 border-t border-border">
        {planFeatures.upgradeable ? (
          <button
            onClick={handlePlanChange}
            className="w-full py-2 px-4 bg-gradient-to-r from-blue-500 to-purple-500 dark:from-blue-600 dark:to-purple-600 rounded-lg text-white font-medium hover:from-blue-600 hover:to-purple-600 dark:hover:from-blue-700 dark:hover:to-purple-700 transition-all duration-300 shadow-sm hover:shadow transform hover:-translate-y-0.5"
          >
            プランをアップグレード
          </button>
        ) : (
          <button
            onClick={handlePlanChange}
            className="w-full py-2 px-4 bg-muted text-muted-foreground rounded-lg font-medium hover:bg-muted/80 transition-all duration-300"
          >
            プランを管理
          </button>
        )}
      </div>
    </div>
  );
};
