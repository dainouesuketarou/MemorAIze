'use client';

import { AlertCircle, Brain, LoaderCircle, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/lib/store/store';
import {
  setLimit,
  setLoading,
  setError,
} from '@/lib/store/slices/aiGenerationLimitSlice';
import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import Link from 'next/link';
import { useSubscription } from '@/hooks/use-subscription';
import { useEffect } from 'react';
import { AiGenerationLimitResponse } from '@/types/ai-generation-limit';

/**
 * ヘッダー用のコンパクト表示
 * 残り 10 % 未満で文字色を赤系に
 */
export function AiLimitBadge({
  className,
  hideInStudy = false,
}: {
  className?: string;
  hideInStudy?: boolean;
}) {
  const dispatch = useDispatch();
  const { limit, isLoading } = useSelector(
    (state: RootState) => state.aiGenerationLimit,
  );
  const { subscription } = useSubscription();
  const userId = useSelector((state: RootState) => state.user.id);

  // AI生成制限の取得は不要（Reduxから取得）
  useEffect(() => {
    if (!userId || limit) return;

    const fetchLimit = async () => {
      try {
        const res = await fetch(`/api/ai-generation-limit?userId=${userId}`);
        if (!res.ok) throw new Error('AI生成制限の取得に失敗しました');
        const data: AiGenerationLimitResponse = await res.json();
        if (data.error) {
          throw new Error(data.error);
        }
        dispatch(setLimit(data.limit));
      } catch (error) {
        console.error('AI生成制限取得エラー:', error);
        dispatch(setError('AI生成制限の取得に失敗しました'));
      }
    };

    fetchLimit();
  }, [userId, dispatch, limit]);

  // 学習画面では表示しない
  if (hideInStudy) return null;

  const isProUser =
    subscription?.plan === 'PRO_MONTHLY' || subscription?.plan === 'PRO_YEARLY';

  if (isLoading) {
    return (
      <Card className="mb-4">
        <CardContent className="p-4">
          <div
            className={cn(
              'flex items-center gap-2 px-3 py-1.5 bg-muted rounded-md',
              className,
            )}
          >
            <LoaderCircle className="h-4 w-4 animate-spin text-muted-foreground" />
            <span className="text-sm font-medium">読み込み中...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!limit) return null;

  const isNearLimit = limit.monthlyUsage >= limit.monthlyLimit * 0.8; // 80%以上使用で警告表示

  return (
    <Card className="mb-4">
      <CardContent className="p-4">
        {isProUser ? (
          <div className="flex flex-col space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div>
                  <p className="text-sm font-medium text-purple-600">
                    Proプラン: AI生成機能が無制限で利用可能
                  </p>
                  <p className="text-sm text-muted-foreground">
                    いつでもAI機能をお使いいただけます
                  </p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex flex-col space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <AlertCircle
                  className={cn(
                    'h-5 w-5',
                    isNearLimit ? 'text-red-500' : 'text-yellow-600',
                  )}
                />
                <div>
                  <p className="text-sm font-medium">
                    今月のAI生成回数: {limit.monthlyUsage || 0}/
                    {limit.monthlyLimit || 0}回
                  </p>
                  <p
                    className={cn(
                      'text-sm',
                      isNearLimit ? 'text-red-500' : 'text-muted-foreground',
                    )}
                  >
                    残り{(limit.monthlyLimit || 0) - (limit.monthlyUsage || 0)}
                    回生成できます
                  </p>
                </div>
              </div>
              <Button asChild variant="default" className="gap-2">
                <Link href="/subscription">
                  <Sparkles className="h-4 w-4" />
                  アップグレード
                </Link>
              </Button>
            </div>
            {isNearLimit && (
              <div className="text-sm text-red-500 bg-red-50 p-3 rounded-md">
                AI生成回数が残りわずかです。Proプランにアップグレードして、無制限にAI機能をお使いください。
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
