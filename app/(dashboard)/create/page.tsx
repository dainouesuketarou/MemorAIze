'use client';

import { useState, useEffect } from 'react';
import { DashboardHeader } from '@/components/dashboard/header';
import { DashboardShell } from '@/components/dashboard/shell';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Brain, Hand, Home, Sparkles } from 'lucide-react';
import Link from 'next/link';
import { AiGenerateForm } from '@/components/cards/ai-generate-form';
import { ManualCreateForm } from '@/components/cards/manual-create-form';
import { Deck, Group, Subscription } from '@prisma/client';
import { DeckWithCardsAndGroups } from '@/components/dashboard/deck-list';
import { useSession } from 'next-auth/react';
import { useAiGenerationLimit } from '@/hooks/use-ai-generation-limit';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/lib/store/store';
import { setSubscription } from '@/lib/store/slices/userSlice';

export default function CreatePage() {
  const { data: session } = useSession();
  const [groups, setGroups] = useState<Group[]>([]);
  const [decks, setDecks] = useState<DeckWithCardsAndGroups[]>([]);
  const [groupMode, setGroupMode] = useState(false);
  const { limit, loading: limitLoading } = useAiGenerationLimit();
  const subscription = useSelector(
    (state: RootState) => state.user.subscription,
  );
  const dispatch = useDispatch();

  useEffect(() => {
    if (!session?.user?.id) return;

    fetch('/api/groups')
      .then((res) => res.json())
      .then(setGroups);
    fetch('/api/decks')
      .then((res) => res.json())
      .then((data) => {
        const decksWithCards: DeckWithCardsAndGroups[] = data.map(
          (deck: any) => ({
            ...deck,
            cards: deck.cards ?? [],
          }),
        );
        setDecks(decksWithCards);
      });
  }, [session]);

  useEffect(() => {
    const fetchSubscription = async () => {
      try {
        const subscriptionResponse = await fetch('/api/subscription/status');
        if (!subscriptionResponse.ok) {
          throw new Error('サブスクリプション情報の取得に失敗しました');
        }
        const subscriptionData: Subscription =
          await subscriptionResponse.json();
        dispatch(setSubscription(subscriptionData));
      } catch (error) {
        console.error('サブスクリプション情報の取得に失敗しました:', error);
      }
    };

    fetchSubscription();
  }, [dispatch]);

  const isProUser =
    subscription?.plan === 'PRO_MONTHLY' || subscription?.plan === 'PRO_YEARLY';
  const isAiGenerationDisabled =
    !isProUser && limit !== null && limit.count >= limit.limit;

  if (!session?.user?.id) {
    return (
      <DashboardShell
        groups={groups}
        decks={decks}
        setDecks={setDecks}
        groupMode={groupMode}
        setGroupMode={setGroupMode}
      >
        <div className="w-full text-center py-20 text-lg text-muted-foreground">
          ログインが必要です
        </div>
      </DashboardShell>
    );
  }

  return (
    <DashboardShell
      groups={groups}
      decks={decks}
      setDecks={setDecks}
      groupMode={groupMode}
      setGroupMode={setGroupMode}
    >
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
            <Card>
              <CardContent className="pt-6">
                <div className="text-center space-y-4">
                  <p className="text-lg font-medium">
                    AI生成回数の上限に達しました
                  </p>
                  <p className="text-muted-foreground">
                    今月のAI生成回数（{limit.count}/{limit.limit}
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
              </CardContent>
            </Card>
          ) : (
            <AiGenerateForm />
          )}
        </TabsContent>
        <TabsContent value="manual">
          <ManualCreateForm />
        </TabsContent>
      </Tabs>
    </DashboardShell>
  );
}
