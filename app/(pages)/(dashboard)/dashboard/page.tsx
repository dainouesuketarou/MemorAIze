// app/dashboard/page.tsx
'use client';

import { useState, useEffect, useMemo } from 'react';
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

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const dispatch = useDispatch<AppDispatch>();
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

  // データローディング中の表示
  if (dataLoading || !user.id) {
    return (
      <DashboardShell groupMode={groupMode} setGroupMode={setGroupMode}>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="flex flex-col items-center space-y-4">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-muted-foreground">データを読み込み中...</p>
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

        <div className="space-y-4">
          <DeckFilter
            filter={reduxFilter}
            setFilter={(filter) =>
              dispatch(setFilter(filter) as unknown as AnyAction)
            }
            sort={reduxSort}
            setSort={(sort) => dispatch(setSort(sort) as unknown as AnyAction)}
          />

          <div className="flex gap-4">
            <div className="flex-1 min-w-0">
              <DeckList
                decks={filteredAndSortedDecks}
                groupMode={groupMode}
                groups={reduxGroups}
                setDecks={(decks: DeckWithCardsAndGroups[]) =>
                  dispatch(setDecks(decks))
                }
              />
            </div>

            <div className="w-1/4 flex-shrink-0">
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
            </div>
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}
