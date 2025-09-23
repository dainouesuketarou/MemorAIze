import { useState } from 'react';
import { Button } from '@/src/components/ui/button';
import { Textarea } from '@/src/components/ui/textarea';
import { toast } from 'sonner';

interface CardEditFormProps {
  cardId: string;
  initialFront: string;
  initialBack: string;
  onSuccess: () => void;
  onCancel: () => void;
}

export function CardEditForm({
  cardId,
  initialFront,
  initialBack,
  onSuccess,
  onCancel,
}: CardEditFormProps) {
  const [front, setFront] = useState(initialFront);
  const [back, setBack] = useState(initialBack);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch(`/api/cards/${cardId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ front, back }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'カードの更新に失敗しました');
      }

      toast.success('カードを更新しました');
      onSuccess();
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'エラーが発生しました';
      toast.error(errorMessage);
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <label htmlFor="front" className="text-sm font-medium">
          表
        </label>
        <Textarea
          id="front"
          value={front}
          onChange={(e) => setFront(e.target.value)}
          required
          rows={3}
        />
      </div>
      <div className="space-y-2">
        <label htmlFor="back" className="text-sm font-medium">
          裏
        </label>
        <Textarea
          id="back"
          value={back}
          onChange={(e) => setBack(e.target.value)}
          required
          rows={3}
        />
      </div>
      <div className="flex gap-2">
        <Button type="submit" className="flex-1" disabled={isLoading}>
          {isLoading ? '更新中...' : '更新'}
        </Button>
        <Button
          type="button"
          variant="outline"
          className="flex-1"
          onClick={onCancel}
        >
          キャンセル
        </Button>
      </div>
    </form>
  );
}
