'use client';

import { Group } from '@prisma/client';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { useSelector } from 'react-redux';
import { RootState } from '@/lib/store/store';

interface SidebarProps {
  groups: Group[];
  setGroups: React.Dispatch<React.SetStateAction<Group[]>>;
  selectedGroup: string;
  setSelectedGroup: (group: string) => void;
  newGroupName: string;
  setNewGroupName: (name: string) => void;
  showGroupInput: boolean;
  setShowGroupInput: (show: boolean) => void;
}

export function Sidebar({
  groups,
  setGroups,
  selectedGroup,
  setSelectedGroup,
  newGroupName,
  setNewGroupName,
  showGroupInput,
  setShowGroupInput,
}: SidebarProps) {
  const [isLoading, setIsLoading] = useState(true);
  const userId = useSelector((state: RootState) => state.user.id);

  /* ───────────────── フェッチ ───────────────── */
  useEffect(() => {
    if (!userId) return;

    setIsLoading(true);
    fetch(`/api/groups?userId=${userId}`)
      .then((r) => r.json())
      .then((data: Group[]) => setGroups(data))
      .catch((e) => {
        console.error('グループ取得エラー:', e);
        toast.error('グループの取得に失敗しました');
      })
      .finally(() => setIsLoading(false));
  }, [userId, setGroups]);

  /* ---------------「すべて」タブを挿入 --------------- */
  const allTab: Group = {
    id: 'all',
    name: 'すべて',
    createdAt: new Date(),
    updatedAt: new Date(),
  } as any;
  const displayGroups = [allTab, ...groups];

  /* ───────────────── 追加 ───────────────── */
  const handleAddGroup = async () => {
    if (!newGroupName.trim()) return;
    setIsLoading(true);
    try {
      const res = await fetch('/api/groups', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newGroupName }),
      });
      if (!res.ok) throw new Error();
      const g = await res.json();
      setGroups((prev) => [...prev, g]);
      setNewGroupName('');
      setShowGroupInput(false);
    } catch {
      toast.error('グループの作成に失敗しました');
    } finally {
      setIsLoading(false);
    }
  };

  /* ───────────────── UI ───────────────── */
  return (
    <aside className="flex flex-col items-center gap-2 py-4 pl-4">
      {isLoading
        ? // ローディング中のスケルトンUI
          Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="relative w-24 h-10 bg-muted animate-pulse"
              style={{
                clipPath: 'polygon(0 0, 100% 0, 85% 100%, 0 100%)',
              }}
            />
          ))
        : displayGroups.map((g) => {
            const active = selectedGroup === g.id;
            return (
              <button
                key={g.id}
                onClick={() => setSelectedGroup(g.id)}
                className={`relative w-24 h-10 pl-4 pr-3 flex items-center text-sm font-medium truncate transition
                ${
                  active
                    ? 'bg-primary text-white shadow-lg'
                    : 'bg-muted text-muted-foreground hover:bg-muted/70'
                }
              `}
                style={{
                  clipPath: 'polygon(0 0, 100% 0, 85% 100%, 0 100%)',
                }}
              >
                {g.name}
                <span
                  className={`absolute left-0 top-0 h-full w-1 rounded-l
                  ${active ? 'bg-white/70' : 'bg-primary/40'}
                `}
                />
              </button>
            );
          })}

      {/* ───── 新規グループ入力 or 追加ボタン ───── */}
      {showGroupInput ? (
        <div className="w-24 mt-1 space-y-1">
          <input
            className="w-full rounded border px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            value={newGroupName}
            onChange={(e) => setNewGroupName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAddGroup()}
            placeholder="新グループ"
            autoFocus
            disabled={isLoading}
          />
          <div className="flex gap-1">
            <Button
              size="sm"
              className="flex-1"
              onClick={handleAddGroup}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <div className="mr-2 h-3 w-3 animate-spin rounded-full border-2 border-background border-t-transparent" />
                  追加中
                </>
              ) : (
                '追加'
              )}
            </Button>
            <Button
              size="sm"
              variant="ghost"
              className="flex-1"
              onClick={() => setShowGroupInput(false)}
              disabled={isLoading}
            >
              ×
            </Button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setShowGroupInput(true)}
          className="w-24 h-8 mt-2 flex items-center justify-center rounded bg-primary/10 text-primary text-sm hover:bg-primary/20 transition"
          style={{
            clipPath: 'polygon(0 0, 100% 0, 85% 100%, 0 100%)',
          }}
          disabled={isLoading}
        >
          ＋新規
        </button>
      )}
    </aside>
  );
}
