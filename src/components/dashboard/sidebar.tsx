'use client';

// import { Group } from '@prisma/client'; // DTOベースの型を使用するため削除
import { GroupWithDetails } from '@/src/types/deck';
import { useEffect, useState, useCallback, useMemo } from 'react';
import { Button } from '@/src/components/ui/button';
import { Skeleton } from '@/src/components/ui/skeleton';
import { toast } from 'sonner';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/src/lib/store/store';
import {
  setGroups,
  setLoading,
  setError,
  deleteGroup,
} from '@/src/lib/store/slices/groupSlice';
import { AnyAction } from '@reduxjs/toolkit';
import { useSession } from 'next-auth/react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/src/components/ui/dropdown-menu';
import { MoreVertical, Trash2 } from 'lucide-react';
import { transformGroupData } from '@/src/lib/utils/data-transform';

interface SidebarProps {
  selectedGroup: string;
  setSelectedGroup: (group: string) => void;
  newGroupName: string;
  setNewGroupName: (name: string) => void;
  showGroupInput: boolean;
  setShowGroupInput: (show: boolean) => void;
}

export function Sidebar({
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
  const reduxGroups = useSelector((state: RootState) => state.group.groups);

  // Reduxから直接データを取得するため、useEffectは不要

  /* ---------------「すべて」タブを挿入 --------------- */
  const allTab = useMemo(
    () =>
      ({
        id: 'all',
        name: 'すべて',
        description: null,
        userId: session?.user?.id || '',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      } as GroupWithDetails),
    [session?.user?.id],
  );

  const displayGroups = useMemo(
    () => [allTab, ...reduxGroups],
    [allTab, reduxGroups],
  );

  // スケルトンUIをメモ化
  const skeletonItems = useMemo(
    () =>
      Array.from({ length: 3 }, (_, i) => (
        <div
          key={`skeleton-${i}`}
          className="relative w-24 min-h-[2.5rem] bg-muted animate-pulse"
          style={{
            clipPath: 'polygon(0 0, 100% 0, 85% 100%, 0 100%)',
          }}
        />
      )),
    [],
  );

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
        const errorData = await response.json();
        throw new Error(errorData.error || 'グループの作成に失敗しました');
      }

      const responseData = await response.json();
      // 新しいDTOレスポンス形式に対応
      const rawGroup = responseData.success ? responseData.data : responseData;
      const transformedGroup = transformGroupData(rawGroup);
      dispatch(
        setGroups([...reduxGroups, transformedGroup]) as unknown as AnyAction,
      );
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
  }, [newGroupName, session?.user?.id, reduxGroups, dispatch]);

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
          const errorData = await response.json();
          throw new Error(errorData.error || 'グループの削除に失敗しました');
        }

        dispatch(deleteGroup(groupId) as unknown as AnyAction);
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
    [dispatch],
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
      <div className="flex flex-col items-center gap-2">
        {isLoading
          ? // ローディング中のスケルトンUI
            skeletonItems
          : displayGroups
              .filter((g) => g && g.id)
              .map((g: GroupWithDetails) => {
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
      </div>

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
