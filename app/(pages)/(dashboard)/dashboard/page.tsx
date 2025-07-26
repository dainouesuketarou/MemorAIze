// app/dashboard/page.tsx
'use client';

import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { Group } from '@prisma/client';
import { DashboardHeader } from '@/src/components/dashboard/header';
import { DashboardShell } from '@/src/components/dashboard/shell';
import { DeckList } from '@/src/components/dashboard/deck-list';
import { Button } from '@/src/components/ui/button';
import { PlusCircle, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { DeckWithCardsAndGroups } from '@/src/types/deck';
import { useSession } from 'next-auth/react';
import { Sidebar } from '@/src/components/dashboard/sidebar';
import { DeckFilter } from '@/src/components/dashboard/deck-filter';
import { toast } from 'sonner';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '@/src/lib/store/store';
import {
  setDecks,
  setLoading,
  setError,
  setFilter,
  setSort,
  fetchDecksIfNeeded,
} from '@/src/lib/store/slices/deckSlice';
import {
  setGroups,
  fetchGroupsIfNeeded,
} from '@/src/lib/store/slices/groupSlice';
import { AnyAction } from '@reduxjs/toolkit';
import { useUserAllData } from '@/src/hooks/useUserAllData';
import { useRouter } from 'next/navigation';

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();
  const {
    user,
    groups: reduxGroups,
    decks: reduxDecks,
    loading: dataLoading,
  } = useUserAllData();
  const {
    isLoading: decksLoading,
    filter: reduxFilter,
    sort: reduxSort,
    lastFetched: decksLastFetched,
  } = useSelector((state: RootState) => state.deck);
  const { lastFetched: groupsLastFetched } = useSelector(
    (state: RootState) => state.group,
  );
  const [selectedGroup, setSelectedGroup] = useState<string>('all');
  const [newGroupName, setNewGroupName] = useState<string>('');
  const [showGroupInput, setShowGroupInput] = useState<boolean>(false);
  const [groupMode, setGroupMode] = useState<boolean>(false);

  // ダッシュボード固有の状態管理
  const [isInitializing, setIsInitializing] = useState(false);
  const [initializationComplete, setInitializationComplete] = useState(false);
  const hasCheckedOnboarding = useRef(false);
  const isProcessing = useRef(false);

  // オンボーディング状態チェック
  const checkOnboardingStatus = useCallback(async () => {
    if (hasCheckedOnboarding.current) {
      console.log('オンボーディング状態は既にチェック済み');
      return;
    }

    hasCheckedOnboarding.current = true;
    console.log('オンボーディング状態をチェック開始');

    try {
      const response = await fetch('/api/auth/onboarding/status');
      const data = await response.json();

      // ログイン履歴を記録（日本時間で記録）
      const now = new Date();
      const jpNow = new Date(now.getTime() + 9 * 60 * 60 * 1000);
      await fetch('/api/auth/login-history', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          loginAt: jpNow.toISOString(),
        }),
      });

      if (!data.isOnboarded) {
        console.log('オンボーディング未完了、オンボーディングページに遷移');
        router.push('/onboarding');
      } else {
        console.log('オンボーディング完了');
        setInitializationComplete(true);
      }
    } catch (error) {
      console.error('オンボーディング状態の確認に失敗しました:', error);
      setInitializationComplete(true);
    }
  }, [router]);

  // 初期化処理
  useEffect(() => {
    const initializeDashboard = async () => {
      if (isProcessing.current || !session?.user?.email) {
        return;
      }

      isProcessing.current = true;
      setIsInitializing(true);
      console.log('ダッシュボード初期化開始');

      try {
        // Reduxにデータがある場合はオンボーディング状態のみチェック
        if (user.id && reduxDecks.length > 0 && reduxGroups.length > 0) {
          console.log(
            'Reduxにデータがあるためオンボーディング状態のみチェック',
          );
          await checkOnboardingStatus();
          return;
        }

        // Reduxにデータがない場合はセッション確認から開始
        console.log('Reduxにデータがないためセッション確認を実行');
        const sessionData = await fetch('/api/auth/session').then((res) =>
          res.json(),
        );

        if (sessionData?.user?.email) {
          console.log('セッション確認成功、オンボーディング状態をチェック');
          await checkOnboardingStatus();
        } else {
          console.log('セッション確認失敗');
          setInitializationComplete(true);
        }
      } catch (error) {
        console.error('ダッシュボード初期化エラー:', error);
        setInitializationComplete(true);
      } finally {
        setIsInitializing(false);
        isProcessing.current = false;
      }
    };

    if (status === 'authenticated' && session?.user?.email) {
      initializeDashboard();
    }
  }, [
    status,
    session,
    user.id,
    reduxDecks.length,
    reduxGroups.length,
    checkOnboardingStatus,
  ]);

  // フィルタリングとソートの適用（Hooksは早期リターンの前に配置）
  const filteredAndSortedDecks = useMemo(() => {
    const filtered =
      selectedGroup === 'all'
        ? reduxDecks
        : reduxDecks.filter((d) =>
            d.groups?.some((g) => g.id === selectedGroup),
          );

    return [...filtered]
      .filter((deck) => {
        if (reduxFilter === 'all') return true;
        if (reduxFilter === 'inProgress')
          return deck.progress && deck.progress > 0 && deck.progress < 1;
        if (reduxFilter === 'completed') return deck.progress === 1;
        if (reduxFilter === 'notStarted')
          return !deck.progress || deck.progress === 0;
        return true;
      })
      .sort((a, b) => {
        if (reduxSort === 'recent') {
          const bTime = b.lastStudied ? new Date(b.lastStudied).getTime() : 0;
          const aTime = a.lastStudied ? new Date(a.lastStudied).getTime() : 0;
          return bTime - aTime;
        }
        if (reduxSort === 'alphabetical') {
          return a.title.localeCompare(b.title);
        }
        if (reduxSort === 'cardCount') {
          return b.cardCount - a.cardCount;
        }
        return 0;
      });
  }, [reduxDecks, selectedGroup, reduxFilter, reduxSort]);

  // セッションのローディング中は何も表示しない
  if (status === 'loading') {
    return null;
  }

  // 認証されていない場合はログインページにリダイレクト
  if (status === 'unauthenticated') {
    return null; // リダイレクトはmiddlewareで処理
  }

  // 初期化中またはデータローディング中の表示
  if (isInitializing || dataLoading || (!initializationComplete && !user.id)) {
    return (
      <DashboardShell groupMode={groupMode} setGroupMode={setGroupMode}>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="flex flex-col items-center space-y-4">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-muted-foreground">
              {isInitializing ? '初期化中...' : 'データを読み込み中...'}
            </p>
          </div>
        </div>
      </DashboardShell>
    );
  }

  return (
    <DashboardShell groupMode={groupMode} setGroupMode={setGroupMode}>
      <div className="space-y-6">
        <DashboardHeader
          heading="マイデッキ"
          description="あなたの学習デッキを管理します。"
        >
          <Link href="/create">
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" />
              新しいデッキを作成
            </Button>
          </Link>
        </DashboardHeader>

        <div className="grid gap-4 md:grid-cols-[1fr_4fr]">
          <Sidebar
            groups={reduxGroups}
            setGroups={(groups) =>
              dispatch(setGroups(groups as Group[]) as unknown as AnyAction)
            }
            selectedGroup={selectedGroup}
            setSelectedGroup={setSelectedGroup}
            newGroupName={newGroupName}
            setNewGroupName={setNewGroupName}
            showGroupInput={showGroupInput}
            setShowGroupInput={setShowGroupInput}
          />

          <div className="space-y-4">
            <DeckFilter
              filter={reduxFilter}
              setFilter={(filter) =>
                dispatch(setFilter(filter) as unknown as AnyAction)
              }
              sort={reduxSort}
              setSort={(sort) =>
                dispatch(setSort(sort) as unknown as AnyAction)
              }
            />
            <DeckList
              decks={filteredAndSortedDecks}
              groupMode={groupMode}
              groups={reduxGroups}
              setDecks={(decks: DeckWithCardsAndGroups[]) =>
                dispatch(setDecks(decks))
              }
            />
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}
