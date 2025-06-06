'use client';
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { LoaderCircle } from 'lucide-react';
import { Group } from '@prisma/client';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface Props {
  deckId: string | string[];
  groups: Group[];
  onSuccess: () => void;
}

export function CardAddManualForm({ deckId, groups, onSuccess }: Props) {
  const [front, setFront] = useState('');
  const [back, setBack] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedGroupIds, setSelectedGroupIds] = useState<string[]>([]);

  useEffect(() => {
    if (groups.length > 0) {
      setSelectedGroupIds([groups[0].id]);
    }
  }, [groups]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!front || !back) {
      toast.error('表面と裏面を入力してください');
      return;
    }
    if (selectedGroupIds.length === 0) {
      toast.error('少なくとも1つの分野を選択してください');
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch('/api/cards', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          deckId,
          front,
          back,
          groupIds: selectedGroupIds,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'カードの追加に失敗しました');
      }

      setIsLoading(false);
      setFront('');
      setBack('');
      onSuccess();
      toast.success('カードを追加しました');
    } catch (e) {
      setIsLoading(false);
      toast.error(
        e instanceof Error ? e.message : 'カードの追加に失敗しました',
      );
    }
  };

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <div>
        <label className="block mb-1 font-medium">表面</label>
        <Textarea
          value={front}
          onChange={(e) => setFront(e.target.value)}
          placeholder="例）Memorize"
          className="min-h-[60px]"
          maxLength={100}
        />
        <p className="text-sm text-muted-foreground mt-1">
          100文字以内で入力してください
        </p>
      </div>
      <div>
        <label className="block mb-1 font-medium">裏面</label>
        <Textarea
          value={back}
          onChange={(e) => setBack(e.target.value)}
          placeholder="例）記憶する、暗記する"
          className="min-h-[60px]"
          maxLength={100}
        />
        <p className="text-sm text-muted-foreground mt-1">
          100文字以内で入力してください
        </p>
      </div>

      {/* グループ選択 */}
      <div className="space-y-4">
        <label className="block font-medium">分野（複数選択可）</label>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {groups.map((group) => (
            <label
              key={group.id}
              className={cn(
                'relative flex items-center justify-center p-3 rounded-lg border-2 cursor-pointer transition-all duration-200',
                selectedGroupIds.includes(group.id)
                  ? 'border-primary bg-primary/5'
                  : 'border-muted-foreground/20 hover:border-primary/50',
              )}
            >
              <input
                type="checkbox"
                className="sr-only"
                checked={selectedGroupIds.includes(group.id)}
                onChange={(e) => {
                  if (e.target.checked) {
                    setSelectedGroupIds((prev) => [...prev, group.id]);
                  } else {
                    setSelectedGroupIds((prev) =>
                      prev.filter((id) => id !== group.id),
                    );
                  }
                }}
              />
              <span
                className={cn(
                  'text-sm font-medium',
                  selectedGroupIds.includes(group.id)
                    ? 'text-primary'
                    : 'text-muted-foreground',
                )}
              >
                {group.name}
              </span>
            </label>
          ))}
        </div>
      </div>

      <Button
        type="submit"
        className="w-full"
        disabled={isLoading || !front || !back}
      >
        {isLoading ? (
          <>
            <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
            追加中...
          </>
        ) : (
          'カードを追加'
        )}
      </Button>
    </form>
  );
}
