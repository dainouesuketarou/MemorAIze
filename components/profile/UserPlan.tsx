import React from 'react';
import { Award, Check, Lock } from 'lucide-react';
import { RootState } from '@/lib/store/store';
import { SubscriptionPlan } from '@prisma/client';
import { useRouter } from 'next/navigation';
import { useDispatch, useSelector } from 'react-redux';
import { useEffect, useState } from 'react';
import { Subscription } from '@prisma/client';
import { setSubscription } from '@/lib/store/slices/userSlice';

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
    color: 'text-gray-600',
    bgColor: 'bg-gray-100',
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
    color: 'text-blue-600',
    bgColor: 'bg-blue-100',
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
    color: 'text-purple-600',
    bgColor: 'bg-purple-100',
    price: '¥9,800/年',
    upgradeable: false,
  },
};

export const UserPlan: React.FC = () => {
  const router = useRouter();
  const subscription = useSelector(
    (state: RootState) => state.user.subscription,
  );
  const dispatch = useDispatch();
  const currentPlan = subscription?.plan || 'FREE';
  const planFeatures = PLAN_FEATURES[currentPlan];

  useEffect(() => {
    const fetchSubscription = async () => {
      try {
        // サブスクリプション情報を取得
        const subscriptionResponse = await fetch('/api/subscription/status');
        if (!subscriptionResponse.ok) {
          throw new Error('サブスクリプション情報の取得に失敗しました');
        }

        const subscriptionData: Subscription =
          await subscriptionResponse.json();

        // Reduxの状態を更新
        dispatch(setSubscription(subscriptionData));
      } catch (error) {
        console.error('サブスクリプション情報の取得に失敗しました:', error);
      }
    };
    fetchSubscription();
  }, []);

  const handlePlanChange = () => {
    router.push('/subscription');
  };

  return (
    <div className="bg-white rounded-xl shadow-sm p-6 transition-all duration-300 hover:shadow-md">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-gray-800">現在のプラン</h2>
        <div
          className={`py-1 px-3 rounded-full text-sm font-medium ${planFeatures.color} ${planFeatures.bgColor}`}
        >
          {planFeatures.displayName}
        </div>
      </div>
      <div className="flex items-center mb-4">
        <div
          className={`w-10 h-10 flex-shrink-0 rounded-full ${planFeatures.bgColor} flex items-center justify-center ${planFeatures.color}`}
        >
          <Award size={20} />
        </div>
        <div className="ml-4">
          <p className="font-medium text-gray-800">
            {planFeatures.displayName}プラン
          </p>
          <p className="text-sm text-gray-500">{planFeatures.price}</p>
        </div>
      </div>
      <div className="space-y-2 mt-4">
        {planFeatures.features.map((feature, index) => (
          <div key={index} className="flex items-start">
            <div className="text-green-500 mt-0.5 mr-2">
              <Check size={16} />
            </div>
            <span className="text-gray-600 text-sm">{feature}</span>
          </div>
        ))}
      </div>
      <div className="pt-4 mt-4 border-t border-gray-100">
        {planFeatures.upgradeable ? (
          <button
            onClick={handlePlanChange}
            className="w-full py-2 px-4 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg text-white font-medium hover:from-blue-600 hover:to-purple-600 transition-all duration-300 shadow-sm hover:shadow transform hover:-translate-y-0.5"
          >
            プランをアップグレード
          </button>
        ) : (
          <button
            onClick={handlePlanChange}
            className="w-full py-2 px-4 bg-gray-100 text-gray-600 rounded-lg font-medium hover:bg-gray-200 transition-all duration-300"
          >
            プランを管理
          </button>
        )}
      </div>
    </div>
  );
};
