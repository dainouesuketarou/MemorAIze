'use client';

import { useState, useEffect } from 'react';
import { Group } from '@prisma/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, X } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/lib/store/store';
import { setGroups, setLoading, setError } from '@/lib/store/slices/groupSlice';
import { AnyAction } from '@reduxjs/toolkit';
import { toast } from 'sonner';

export function Sidebar() {
  const dispatch = useDispatch();
  const { groups, isLoading } = useSelector((state: RootState) => state.group);
  const [selectedGroup, setSelectedGroup] = useState<string>('all');
  const [newGroupName, setNewGroupName] = useState<string>('');
  const [showGroupInput, setShowGroupInput] = useState<boolean>(false);

  // グループデータの取得
  useEffect(() => {
    const fetchGroups = async () => {
      if (!groups?.length) {
        dispatch(setLoading(true) as unknown as AnyAction);
        try {
          const response = await fetch('/api/groups');
          if (!response.ok) {
            throw new Error('グループの取得に失敗しました');
          }
          const data = await response.json();
          dispatch(setGroups(data) as unknown as AnyAction);
        } catch (error) {
          console.error('グループ取得エラー:', error);
          dispatch(
            setError(
              error instanceof Error
                ? error.message
                : 'グループの取得に失敗しました',
            ) as unknown as AnyAction,
          );
          toast.error(
            error instanceof Error
              ? error.message
              : 'グループの取得に失敗しました',
          );
        } finally {
          dispatch(setLoading(false) as unknown as AnyAction);
        }
      }
    };

    fetchGroups();
  }, [groups, dispatch]);

  const handleCreateGroup = async () => {
    if (!newGroupName.trim()) return;
    dispatch(setLoading(true) as unknown as AnyAction);

    try {
      const response = await fetch('/api/groups', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newGroupName }),
      });

      if (!response.ok) {
        throw new Error('グループの作成に失敗しました');
      }

      const newGroup = await response.json();
      dispatch(setGroups([...groups, newGroup]) as unknown as AnyAction);
      setNewGroupName('');
      setShowGroupInput(false);
      toast.success('グループを作成しました');
    } catch (error) {
      console.error('グループ作成エラー:', error);
      dispatch(
        setError(
          error instanceof Error
            ? error.message
            : 'グループの作成に失敗しました',
        ) as unknown as AnyAction,
      );
      toast.error(
        error instanceof Error ? error.message : 'グループの作成に失敗しました',
      );
    } finally {
      dispatch(setLoading(false) as unknown as AnyAction);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">グループ</h2>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setShowGroupInput(!showGroupInput)}
        >
          {showGroupInput ? (
            <X className="h-4 w-4" />
          ) : (
            <Plus className="h-4 w-4" />
          )}
        </Button>
      </div>

      {showGroupInput && (
        <div className="flex gap-2">
          <Input
            placeholder="新しいグループ名"
            value={newGroupName}
            onChange={(e) => setNewGroupName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                handleCreateGroup();
              }
            }}
          />
          <Button
            onClick={handleCreateGroup}
            disabled={isLoading || !newGroupName.trim()}
          >
            作成
          </Button>
        </div>
      )}

      <div className="space-y-2">
        <Button
          variant={selectedGroup === 'all' ? 'default' : 'ghost'}
          className="w-full justify-start"
          onClick={() => setSelectedGroup('all')}
        >
          すべて
        </Button>
        {groups.map((group) => (
          <Button
            key={group.id}
            variant={selectedGroup === group.id ? 'default' : 'ghost'}
            className="w-full justify-start"
            onClick={() => setSelectedGroup(group.id)}
          >
            {group.name}
          </Button>
        ))}
      </div>
    </div>
  );
}
