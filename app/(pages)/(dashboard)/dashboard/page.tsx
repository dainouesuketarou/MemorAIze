// app/dashboard/page.tsx
'use client';

import { useState, useEffect, useMemo } from 'react';
// import { Group } from '@prisma/client'; // DTOベースの型を使用するため削除
import { GroupWithDetails } from '@/src/types/deck';
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
      <DashboardShell>
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
    <DashboardShell>
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
              <DeckList selectedGroup={selectedGroup} />
            </div>

            <div className="w-1/4 flex-shrink-0">
              <Sidebar
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
