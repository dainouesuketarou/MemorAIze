'use client';

import { Group } from '@prisma/client';
import { useEffect, useState, useCallback, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/lib/store/store';
import {
  setGroups,
  setLoading,
  setError,
  deleteGroup,
} from '@/lib/store/slices/groupSlice';
import { AnyAction } from '@reduxjs/toolkit';
import { useSession } from 'next-auth/react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { MoreVertical, Trash2 } from 'lucide-react';

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
  const { data: session } = useSession();
  const dispatch = useDispatch();
  const [isLoading, setIsLoading] = useState(false);

  // グループの取得
  const fetchGroups = useCallback(async () => {
    if (!session?.user?.id) return;

    setIsLoading(true);
    try {
      const response = await fetch(`/api/groups`);
      if (!response.ok) throw new Error('グループの取得に失敗しました');
      const data = await response.json();
      setGroups(data);
      dispatch(setGroups(data) as unknown as AnyAction);
    } catch (error) {
      console.error('グループ取得エラー:', error);
      toast.error('グループの取得に失敗しました');
    } finally {
      setIsLoading(false);
    }
  }, [session?.user?.id, dispatch]);

  useEffect(() => {
    if (session?.user?.id) {
      fetchGroups();
    }
  }, [session?.user?.id]);

  /* ---------------「すべて」タブを挿入 --------------- */
  const allTab = useMemo(
    () =>
      ({
        id: 'all',
        name: 'すべて',
        description: null,
        userId: session?.user?.id || '',
        createdAt: new Date(),
        updatedAt: new Date(),
      } as Group),
    [session?.user?.id],
  );

  const displayGroups = useMemo(() => [allTab, ...groups], [allTab, groups]);

  /* ───────────────── 追加 ───────────────── */
  const handleAddGroup = useCallback(async () => {
    if (!newGroupName.trim() || !session?.user?.id) return;

    // 文字数制限のチェック
    if (newGroupName.length < 1 || newGroupName.length > 15) {
      toast.error('グループ名は1文字以上15文字以下で入力してください');
      return;
    }

    dispatch(setLoading(true) as unknown as AnyAction);

    try {
      const response = await fetch('/api/groups', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newGroupName,
          userId: session.user.id,
        }),
      });

      if (!response.ok) {
        throw new Error('グループの作成に失敗しました');
      }

      const newGroup = await response.json();
      dispatch(setGroups([...groups, newGroup]) as unknown as AnyAction);
      setGroups([...groups, newGroup]);
      setNewGroupName('');
      setShowGroupInput(false);
      toast.success('グループを作成しました');
    } catch (error) {
      console.error('グループ作成エラー:', error);
      dispatch(
        setError('グループの作成に失敗しました') as unknown as AnyAction,
      );
      toast.error('グループの作成に失敗しました');
    } finally {
      dispatch(setLoading(false) as unknown as AnyAction);
    }
  }, [newGroupName, session?.user?.id, groups, dispatch, setGroups]);

  /* ───────────────── 削除 ───────────────── */
  const handleDeleteGroup = useCallback(
    async (groupId: string) => {
      if (groupId === 'all') return;
      dispatch(setLoading(true) as unknown as AnyAction);

      try {
        const response = await fetch(`/api/groups?id=${groupId}`, {
          method: 'DELETE',
        });

        if (!response.ok) {
          throw new Error('グループの削除に失敗しました');
        }

        dispatch(deleteGroup(groupId) as unknown as AnyAction);
        setGroups(groups.filter((g) => g.id !== groupId));
        toast.success('グループを削除しました');
      } catch (error) {
        console.error('グループ削除エラー:', error);
        dispatch(
          setError('グループの削除に失敗しました') as unknown as AnyAction,
        );
        toast.error('グループの削除に失敗しました');
      } finally {
        dispatch(setLoading(false) as unknown as AnyAction);
      }
    },
    [groups, dispatch, setGroups],
  );

  const handleGroupSelect = useCallback(
    (groupId: string) => {
      setSelectedGroup(groupId);
    },
    [setSelectedGroup],
  );

  const handleNewGroupNameChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setNewGroupName(e.target.value);
    },
    [setNewGroupName],
  );

  const handleNewGroupKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter') {
        handleAddGroup();
      }
    },
    [handleAddGroup],
  );

  const handleShowGroupInput = useCallback(() => {
    setShowGroupInput(true);
  }, [setShowGroupInput]);

  const handleHideGroupInput = useCallback(() => {
    setShowGroupInput(false);
  }, [setShowGroupInput]);

  return (
    <aside className="flex flex-col items-center gap-2 py-4 pl-4">
      {isLoading
        ? // ローディング中のスケルトンUI
          Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="relative w-24 min-h-[2.5rem] bg-muted animate-pulse"
              style={{
                clipPath: 'polygon(0 0, 100% 0, 85% 100%, 0 100%)',
              }}
            />
          ))
        : displayGroups.map((g: Group) => {
            const active = selectedGroup === g.id;
            return (
              <div key={g.id} className="relative group">
                <button
                  onClick={() => handleGroupSelect(g.id)}
                  className={`relative w-24 min-h-[2.5rem] pl-4 pr-3 flex items-center text-sm font-medium transition
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
                  <span className="line-clamp-2 text-left">{g.name}</span>
                  <span
                    className={`absolute left-0 top-0 h-full w-1 rounded-l
                      ${active ? 'bg-white/70' : 'bg-primary/40'}
                    `}
                  />
                </button>
                {g.id !== 'all' && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="absolute -right-8 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        className="text-red-600"
                        onClick={() => handleDeleteGroup(g.id)}
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        削除
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </div>
            );
          })}

      {/* ───── 新規グループ入力 or 追加ボタン ───── */}
      {showGroupInput ? (
        <div className="w-24 mt-1 space-y-1">
          <input
            className="w-full rounded border px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            value={newGroupName}
            onChange={handleNewGroupNameChange}
            onKeyDown={handleNewGroupKeyDown}
            placeholder="新グループ"
            maxLength={15}
            minLength={1}
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
              onClick={handleHideGroupInput}
              disabled={isLoading}
            >
              ×
            </Button>
          </div>
        </div>
      ) : (
        <button
          onClick={handleShowGroupInput}
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
