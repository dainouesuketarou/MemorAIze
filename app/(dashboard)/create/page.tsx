'use client';

import { useState, useEffect } from 'react';
import { DashboardHeader } from '@/components/dashboard/header';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Brain, Hand, Home, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { AiGenerateForm } from '@/components/cards/ai-generate-form';
import { ManualCreateForm } from '@/components/cards/manual-create-form';
import { Group, Subscription } from '@prisma/client';
import { useSession } from 'next-auth/react';
import { useAiGenerationLimit } from '@/hooks/use-ai-generation-limit';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/lib/store/store';
import { toast } from 'sonner';
import { HeaderNav } from '@/components/dashboard/header-nav';

export default function CreatePage() {
  const { data: session } = useSession();
  const [groups, setGroups] = useState<Group[]>([]);
  const [groupMode, setGroupMode] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { limit, isLoading } = useAiGenerationLimit();
  const subscription = useSelector(
    (state: RootState) => state.user.subscription,
  );
  const dispatch = useDispatch();

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

  // グループの取得
  useEffect(() => {
    if (!session?.user?.id) return;

    const fetchGroups = async () => {
      try {
        const response = await fetch(`/api/groups`);
        if (!response.ok) throw new Error('グループの取得に失敗しました');
        const data = await response.json();
        setGroups(data);
      } catch (error) {
        console.error('グループ取得エラー:', error);
        toast.error('グループの取得に失敗しました');
      }
    };

    fetchGroups();
  }, [session?.user?.id]);

  // サブスクリプション情報の取得
  useEffect(() => {
    const fetchSubscription = async () => {
      try {
        const subscriptionResponse = await fetch('/api/subscription/status');
        if (!subscriptionResponse.ok) {
          throw new Error('サブスクリプション情報の取得に失敗しました');
        }
        const subscriptionData: Subscription =
          await subscriptionResponse.json();
        dispatch({
          type: 'user/setSubscription',
          payload: subscriptionData,
        });
      } catch (error) {
        console.error('サブスクリプション情報の取得に失敗しました:', error);
        toast.error('サブスクリプション情報の取得に失敗しました');
      }
    };

    fetchSubscription();
  }, [dispatch]);

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
                      今月のAI生成回数（{limit.monthlyUsage}/
                      {limit.monthlyLimit}
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
