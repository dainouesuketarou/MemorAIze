// app/dashboard/page.tsx
'use client';

import { useState, useEffect, useMemo } from 'react';
import { Group } from '@prisma/client';
import { DashboardHeader } from '@/components/dashboard/header';
import { DashboardShell } from '@/components/dashboard/shell';
import { DeckList } from '@/components/dashboard/deck-list';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import Link from 'next/link';
import { DeckWithCardsAndGroups } from '@/types/deck';
import { useSession } from 'next-auth/react';
import { Sidebar } from '@/components/dashboard/sidebar';
import { DeckFilter } from '@/components/dashboard/deck-filter';
import { toast } from 'sonner';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '@/lib/store/store';
import {
  setDecks,
  setLoading,
  setError,
  setFilter,
  setSort,
} from '@/lib/store/slices/deckSlice';
import { setGroups } from '@/lib/store/slices/groupSlice';
import { AnyAction } from '@reduxjs/toolkit';

export default function DashboardPage() {
  const { data: session } = useSession();
  const dispatch = useDispatch<AppDispatch>();
  const {
    decks: reduxDecks,
    isLoading: decksLoading,
    filter: reduxFilter,
    sort: reduxSort,
  } = useSelector((state: RootState) => state.deck);
  const { groups: reduxGroups } = useSelector(
    (state: RootState) => state.group,
  );
  const [selectedGroup, setSelectedGroup] = useState<string>('all');
  const [newGroupName, setNewGroupName] = useState<string>('');
  const [showGroupInput, setShowGroupInput] = useState<boolean>(false);
  const [groupMode, setGroupMode] = useState<boolean>(false);

  useEffect(() => {
    if (!session?.user?.id) return;

    const fetchData = async () => {
      dispatch(setLoading(true));
      try {
        // デッキの取得
        const decksRes = await fetch('/api/decks');
        if (!decksRes.ok) throw new Error('デッキ一覧の取得に失敗しました');
        const decksData = await decksRes.json();
        const formattedDecks = decksData.map((deck: any) => ({
          ...deck,
          cards: deck.cards || [],
          lastStudied: deck.lastStudied ? String(deck.lastStudied) : null,
          groups: deck.groups || [],
        }));
        dispatch(setDecks(formattedDecks));

        // グループの取得
        const groupsRes = await fetch(`/api/groups?userId=${session.user.id}`);
        if (!groupsRes.ok) throw new Error('グループ一覧の取得に失敗しました');
        const groupsData = await groupsRes.json();
        dispatch(setGroups(groupsData));
      } catch (error) {
        console.error('データ取得エラー:', error);
        dispatch(
          setError(
            error instanceof Error
              ? error.message
              : 'データの取得に失敗しました',
          ),
        );
        toast.error('データの取得に失敗しました');
      } finally {
        dispatch(setLoading(false));
      }
    };

    fetchData();
  }, [session?.user?.id, dispatch]);

  // フィルタリングとソートの適用
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

  return (
    <DashboardShell
      groups={reduxGroups}
      decks={reduxDecks as DeckWithCardsAndGroups[]}
      setDecks={(decks: DeckWithCardsAndGroups[]) => dispatch(setDecks(decks))}
      groupMode={groupMode}
      setGroupMode={setGroupMode}
    >
      <div className="space-y-6">
        <DashboardHeader
          heading="マイデッキ"
          description="あなたの暗記カード帳一覧です。"
        >
          <Link href="/create">
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" />
              新規作成
            </Button>
          </Link>
        </DashboardHeader>

        <DeckFilter
          filter={reduxFilter}
          setFilter={(filter) =>
            dispatch(setFilter(filter) as unknown as AnyAction)
          }
          sort={reduxSort}
          setSort={(sort) => dispatch(setSort(sort) as unknown as AnyAction)}
        />

        <div className="py-4 pl-4 pr-8 flex lg:flex-row gap-5">
          <div className="w-4/5 lg:w-10/12">
            <DeckList
              decks={filteredAndSortedDecks}
              groupMode={groupMode}
              groups={reduxGroups}
              setDecks={(decks: DeckWithCardsAndGroups[]) =>
                dispatch(setDecks(decks))
              }
            />
          </div>
          <div className="w-1/5 lg:w-2/12">
            <Sidebar
              groups={reduxGroups as Group[]}
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
    </DashboardShell>
  );
}
