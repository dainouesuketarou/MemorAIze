// app/dashboard/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { Group } from '@prisma/client';
import { DashboardHeader } from '@/components/dashboard/header';
import { DashboardShell } from '@/components/dashboard/shell';
import { DeckList } from '@/components/dashboard/deck-list';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import Link from 'next/link';
import { DeckWithCardsAndGroups } from '@/components/dashboard/deck-list';
import { useSession } from 'next-auth/react';
import { Sidebar } from '@/components/dashboard/sidebar';
import { DeckFilter } from '@/components/dashboard/deck-filter';
import { toast } from 'sonner';

export default function DashboardPage() {
  const { data: session } = useSession();
  const [decks, setDecks] = useState<DeckWithCardsAndGroups[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [selectedGroup, setSelectedGroup] = useState<string>('all');
  const [newGroupName, setNewGroupName] = useState<string>('');
  const [showGroupInput, setShowGroupInput] = useState<boolean>(false);
  const [groupMode, setGroupMode] = useState<boolean>(false);
  const [filter, setFilter] = useState<
    'all' | 'inProgress' | 'completed' | 'notStarted'
  >('all');
  const [sort, setSort] = useState<'recent' | 'alphabetical' | 'cardCount'>(
    'recent',
  );

  useEffect(() => {
    if (!session?.user?.id) return;

    const fetchDecks = async () => {
      try {
        const res = await fetch('/api/decks');
        if (!res.ok) {
          throw new Error('デッキ一覧の取得に失敗しました');
        }
        const data: Partial<DeckWithCardsAndGroups>[] = await res.json();
        const mapped = data.map((d) => ({
          ...d,
          cards: d.cards ?? [],
          groups: d.groups ?? [],
        })) as DeckWithCardsAndGroups[];
        setDecks(mapped);
      } catch (error) {
        console.error('デッキ取得エラー:', error);
        toast.error('デッキ一覧の取得に失敗しました');
      }
    };

    fetchDecks();
  }, [session]);

  useEffect(() => {
    const refresh = async () => {
      try {
        const res = await fetch('/api/decks');
        if (!res.ok) {
          throw new Error('デッキ一覧の取得に失敗しました');
        }
        const data: Partial<DeckWithCardsAndGroups>[] = await res.json();
        const mapped = data.map((d) => ({
          ...d,
          cards: d.cards ?? [],
          groups: d.groups ?? [],
        })) as DeckWithCardsAndGroups[];
        setDecks(mapped);
      } catch (error) {
        console.error('デッキ取得エラー:', error);
        toast.error('デッキ一覧の取得に失敗しました');
      }
    };

    window.addEventListener('refreshDecks', refresh);
    return () => window.removeEventListener('refreshDecks', refresh);
  }, []);

  // グループ選択フィルタリング
  const filteredDecks =
    selectedGroup === 'all'
      ? decks
      : decks.filter((d) => d.groups.some((g) => g.id === selectedGroup));

  // フィルタリングとソートの適用
  const filteredAndSortedDecks = [...filteredDecks]
    .filter((deck) => {
      if (filter === 'all') return true;
      if (filter === 'inProgress')
        return deck.progress > 0 && deck.progress < 1;
      if (filter === 'completed') return deck.progress === 1;
      if (filter === 'notStarted') return deck.progress === 0;
      return true;
    })
    .sort((a, b) => {
      if (sort === 'recent') {
        const bTime = b.lastStudied ? new Date(b.lastStudied).getTime() : 0;
        const aTime = a.lastStudied ? new Date(a.lastStudied).getTime() : 0;
        return bTime - aTime;
      }
      if (sort === 'alphabetical') {
        return a.title.localeCompare(b.title);
      }
      if (sort === 'cardCount') {
        return b.cardCount - a.cardCount;
      }
      return 0;
    });

  return (
    <DashboardShell
      groups={groups}
      decks={decks}
      setDecks={setDecks}
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
          filter={filter}
          setFilter={setFilter}
          sort={sort}
          setSort={setSort}
        />

        <div className="py-4 pl-4 pr-8 flex lg:flex-row gap-5">
          <div className="w-4/5 lg:w-10/12">
            <DeckList
              decks={filteredAndSortedDecks}
              groupMode={groupMode}
              groups={groups}
              setDecks={setDecks}
            />
          </div>
          <div className="w-1/5 lg:w-2/12">
            <Sidebar
              groups={groups}
              setGroups={setGroups}
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
