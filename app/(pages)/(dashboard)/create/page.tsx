'use client';

import { useState, useEffect } from 'react';
import { DashboardHeader } from '@/src/components/dashboard/header';
import { Button } from '@/src/components/ui/button';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/src/components/ui/tabs';
import { Brain, Hand, Home, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { AiGenerateForm } from '@/src/components/cards/ai-generate-form';
import { ManualCreateForm } from '@/src/components/cards/manual-create-form';
import { Group, Subscription } from '@prisma/client';
import { useSession } from 'next-auth/react';
import { useAiGenerationLimit } from '@/src/hooks/use-ai-generation-limit';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '@/src/lib/store/store';
import { toast } from 'sonner';
import { HeaderNav } from '@/src/components/dashboard/header-nav';
import { fetchGroupsIfNeeded } from '@/src/lib/store/slices/groupSlice';
import { useSubscription } from '@/src/hooks/use-subscription';

export default function CreatePage() {
  const { data: session } = useSession();
  const [groupMode, setGroupMode] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { limit, isLoading: isLimitLoading } = useAiGenerationLimit();
  const dispatch = useDispatch<AppDispatch>();

  // Reduxの状態を取得
  const { groups, isLoading: isGroupsLoading } = useSelector(
    (state: RootState) => state.group,
  );
  const { subscription, isLoading: isSubscriptionLoading } = useSubscription();

  // スクロールイベントの最適化
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

  // グループの取得（Reduxの状態が空の場合のみ）
  useEffect(() => {
    if (!session?.user?.id || groups.length > 0) return;
    dispatch(fetchGroupsIfNeeded());
  }, [session?.user?.id, groups.length, dispatch]);

  const isProUser =
    subscription?.plan === 'PRO_MONTHLY' || subscription?.plan === 'PRO_YEARLY';
  const isAiGenerationDisabled =
    !isProUser && limit !== null && limit.monthlyUsage >= limit.monthlyLimit;

  if (!session?.user?.id) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="w-full text-center py-20 text-lg text-muted-foreground">
          ログインが必要です
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <HeaderNav
        groupMode={groupMode}
        setGroupMode={setGroupMode}
        scrolled={scrolled}
      />

      <main className="flex-1 py-8">
        <div className="container mx-auto px-4">
          <DashboardHeader
            heading="新規作成"
            description="AIで生成または手動で暗記カード帳を作成します。"
          >
            <Link href="/dashboard">
              <Button variant="outline">
                <Home className="mr-2 h-4 w-4" />
                ダッシュボードへ
              </Button>
            </Link>
          </DashboardHeader>

          <Tabs
            defaultValue={isAiGenerationDisabled ? 'manual' : 'ai'}
            className="space-y-6"
          >
            <TabsList>
              <TabsTrigger value="ai" disabled={isAiGenerationDisabled}>
                <Brain className="mr-2 h-4 w-4" />
                AI生成
                {isAiGenerationDisabled && !isProUser && (
                  <span className="ml-2 text-xs text-red-500">
                    (上限に達しました)
                  </span>
                )}
              </TabsTrigger>
              <TabsTrigger value="manual">
                <Hand className="mr-2 h-4 w-4" />
                手動作成
              </TabsTrigger>
            </TabsList>
            <TabsContent value="ai">
              {isAiGenerationDisabled && !isProUser ? (
                <div className="bg-card rounded-lg border p-6">
                  <div className="text-center space-y-4">
                    <p className="text-lg font-medium">
                      AI生成回数の上限に達しました
                    </p>
                    <p className="text-muted-foreground">
                      今月のAI生成回数（{limit?.monthlyUsage ?? 0}/
                      {limit?.monthlyLimit ?? 0}
                      回）の上限に達しました。
                      Proプランにアップグレードすると、無制限にAI機能をご利用いただけます。
                    </p>
                    <Button asChild>
                      <Link href="/subscription">
                        <Sparkles className="mr-2 h-4 w-4" />
                        Proプランにアップグレード
                      </Link>
                    </Button>
                  </div>
                </div>
              ) : (
                <AiGenerateForm groups={groups} />
              )}
            </TabsContent>
            <TabsContent value="manual">
              <ManualCreateForm groups={groups} />
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
}
