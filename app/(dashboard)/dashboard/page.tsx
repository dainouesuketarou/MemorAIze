// app/dashboard/page.tsx (あるいは pages/dashboard.tsx)
'use client';

import { useState, useEffect } from 'react';
import { DashboardHeader } from '@/components/dashboard/header';
import { DashboardShell } from '@/components/dashboard/shell';
import { DeckList } from '@/components/dashboard/deck-list';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import Link from 'next/link';
import { Deck, Group } from '@prisma/client';

export default function DashboardPage() {
  const [decks, setDecks] = useState<(Deck & { groups: Group[] })[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [selectedGroup, setSelectedGroup] = useState<string>('all');
  const [newGroupName, setNewGroupName] = useState<string>('');
  const [showGroupInput, setShowGroupInput] = useState<boolean>(false);
  const [groupMode, setGroupMode] = useState<boolean>(false);

  useEffect(() => {
    // DBからデッキ一覧を取得
    fetch('/api/decks')
      .then(res => res.json())
      .then(data => setDecks(data))
      .catch(e => {
        console.error('デッキ取得エラー:', e);
        // 必要ならエラー表示
      });
    fetch('/api/groups')
      .then(res => res.json())
      .then(data => {
        // 先頭に「すべて」を追加
        setGroups([{ id: 'all', name: 'すべて' }, ...data]);
      })
      .catch(e => console.error('グループ取得エラー:', e));
  }, []);

  // フィルタリング
  const filteredDecks = selectedGroup === 'all'
    ? decks
    : decks.filter(d => d.groups.some(g => g.id === selectedGroup));

  // グループ追加
  const handleAddGroup = async () => {
    if (!newGroupName.trim()) return;
    try {
      const res = await fetch('/api/groups', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newGroupName.trim() })
      });
      if (!res.ok) throw new Error('グループ作成失敗');
      const newGroup = await res.json();
      setGroups(prev => [...prev, newGroup]);
      setNewGroupName('');
      setShowGroupInput(false);
    } catch (e) {
      alert('グループ作成に失敗しました');
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
        heading="暗記カード帳"
        description="AIで生成または手動で作成した暗記カード帳を管理します。"
      >
        <Link href="/create">
          <Button className="h-10">
            <PlusCircle className="mr-2 h-4 w-4" />
            新規作成
          </Button>
        </Link>
      </DashboardHeader>

      <div className="flex flex-row gap-0 min-h-[600px]">
        {/* メイン：デッキリスト */}
        <div className="flex-1">
          <DeckList decks={filteredDecks} groupMode={groupMode} groups={groups} setDecks={setDecks} />
        </div>

        {/* サイドバー：縦タブグループ */}
        <div className="flex flex-col items-center gap-2 ml-4 py-4" style={{ width: 90 }}>
          {groups.map(group => (
            <button
              key={group.id}
              className={`w-[80px] h-[56px] flex items-center justify-center
                rounded-l-lg border-l-4 transition-colors duration-150
                ${selectedGroup === group.id
                  ? 'bg-primary text-white border-primary shadow-md'
                  : 'bg-gray-100 text-gray-500 border-transparent hover:bg-gray-200 hover:text-gray-700'
                }`}
              style={{
                fontWeight: selectedGroup === group.id ? 'bold' : 'normal',
                fontSize: 16,
                letterSpacing: 1
              }}
              onClick={() => setSelectedGroup(group.id)}
            >
              {group.name}
            </button>
          ))}

          {showGroupInput ? (
            <div className="flex flex-col gap-1 mt-2 w-[80px]">
              <input
                className="border rounded px-2 py-1 text-sm"
                value={newGroupName}
                onChange={e => setNewGroupName(e.target.value)}
                placeholder="新グループ"
                onKeyDown={e => { if (e.key === 'Enter') handleAddGroup(); }}
                autoFocus
              />
              <div className="flex gap-1">
                <Button size="sm" className="flex-1" onClick={handleAddGroup}>
                  追加
                </Button>
                <Button size="sm" variant="ghost" className="flex-1" onClick={() => setShowGroupInput(false)}>
                  ×
                </Button>
              </div>
            </div>
          ) : (
            <button
              className="w-[80px] h-[40px] mt-2 text-primary bg-white border border-dashed border-primary rounded-l-lg hover:bg-primary/10 transition-colors"
              onClick={() => setShowGroupInput(true)}
            >
              ＋新規
            </button>
          )}
        </div>
      </div>
    </DashboardShell>
  );
}
