'use client';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { LoaderCircle } from 'lucide-react';
import { Group } from '@prisma/client';
import { toast } from 'sonner';
import { useDispatch } from 'react-redux';
import { addCard } from '@/lib/store/slices/deckSlice';

interface Props {
  deckId: string | string[];
  groups: Group[];
  onSuccess: () => void;
}

export function CardAddManualForm({ deckId, onSuccess }: Props) {
  const [front, setFront] = useState('');
  const [back, setBack] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const dispatch = useDispatch();

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!front || !back) {
      toast.error('表面と裏面を入力してください');
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
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'カードの追加に失敗しました');
      }

      const data = await res.json();

      // Reduxの状態を更新
      dispatch(
        addCard({
          deckId: deckId as string,
          card: {
            id: data.id,
            front: data.front,
            back: data.back,
            status: 'UNLEARNED',
            order: data.order,
            favorite: false,
          },
        }),
      );

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
