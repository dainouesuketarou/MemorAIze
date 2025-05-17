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

export default function DashboardPage() {
  const { data: session } = useSession();
  const [decks, setDecks] = useState<DeckWithCardsAndGroups[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [selectedGroup, setSelectedGroup] = useState<string>('all');
  const [newGroupName, setNewGroupName] = useState<string>('');
  const [showGroupInput, setShowGroupInput] = useState<boolean>(false);
  const [groupMode, setGroupMode] = useState<boolean>(false);

  useEffect(() => {
    if (!session?.user?.id) return;

    // デッキ一覧取得（cards／groups がない場合は空配列で初期化）
    fetch('/api/decks')
      .then(res => res.json())
      .then((data: Partial<DeckWithCardsAndGroups>[]) => {
        const mapped = data.map(d => ({
          ...d,
          cards: d.cards ?? [],
          groups: d.groups ?? [],
        })) as DeckWithCardsAndGroups[];
        setDecks(mapped);
      })
      .catch(e => console.error('デッキ取得エラー:', e));
  }, [session]);

  // グループ選択フィルタリング
  const filteredDecks = selectedGroup === 'all'
    ? decks
    : decks.filter(d => d.groups.some(g => g.id === selectedGroup));

  return (
    <DashboardShell
      groups={groups}
      decks={decks}
      setDecks={setDecks}
      groupMode={groupMode}
      setGroupMode={setGroupMode}
    >
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

      <div className="flex">
        <div className="flex-1">
          <DeckList
            decks={filteredDecks}
            groupMode={groupMode}
            groups={groups}
            setDecks={setDecks}
          />
        </div>
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
    </DashboardShell>
  );
}
