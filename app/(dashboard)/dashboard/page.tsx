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

    // グループ一覧取得
    fetch('/api/groups')
      .then(res => res.json())
      .then((data: Group[]) => {
        setGroups([  ...data]);
      })
      .catch(e => console.error('グループ取得エラー:', e));
  }, [session]);

  // グループ選択フィルタリング
  const filteredDecks = selectedGroup === 'all'
    ? decks
    : decks.filter(d => d.groups.some(g => g.id === selectedGroup));

  const handleAddGroup = async () => {
    if (!newGroupName.trim()) return;

    try {
      const res = await fetch('/api/groups', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newGroupName }),
      });

      if (!res.ok) throw new Error('グループ作成失敗');

      const newGroup = await res.json();
      setGroups(prev => [...prev, newGroup]);
      setNewGroupName('');
      setShowGroupInput(false);
    } catch (e) {
      console.error('グループ作成エラー:', e);
      alert('グループの作成に失敗しました');
    }
  };

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

        <div className="flex flex-col items-center ml-4 py-4" style={{ width: 90 }}>
          {groups.map(group => (
            <button
              key={group.id}
              onClick={() => setSelectedGroup(group.id)}
              className={`w-[80px] h-[56px] flex items-center justify-center rounded-l-lg border-l-4 transition 
                ${selectedGroup === group.id
                  ? 'bg-primary text-white border-primary'
                  : 'bg-gray-100 text-gray-500 border-transparent hover:bg-gray-200'
                }`}
            >
              {group.name}
            </button>
          ))}

          {showGroupInput ? (
            <div className="mt-2 w-[80px]">
              <input
                className="w-full border rounded px-2 py-1"
                value={newGroupName}
                onChange={e => setNewGroupName(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleAddGroup()}
                autoFocus
                placeholder="新グループ"
              />
              <div className="flex gap-1 mt-1">
                <Button size="sm" className="flex-1" onClick={handleAddGroup}>追加</Button>
                <Button size="sm" variant="ghost" className="flex-1" onClick={() => setShowGroupInput(false)}>×</Button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setShowGroupInput(true)}
              className="w-[80px] h-[40px] mt-2 border-dashed border-primary text-primary rounded-l-lg hover:bg-primary/10"
            >
              ＋新規
            </button>
          )}
        </div>
      </div>
    </DashboardShell>
  );
}
