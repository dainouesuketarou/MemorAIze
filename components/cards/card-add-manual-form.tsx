"use client";
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { LoaderCircle } from 'lucide-react';

interface Props {
  deckId: string | string[];
  onSuccess: () => void;
}

export function CardAddManualForm({ deckId, onSuccess }: Props) {
  const [front, setFront] = useState('');
  const [back, setBack] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await fetch('/api/cards', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          deckId,
          front,
          back,
        }),
      });
      setIsLoading(false);
      setFront('');
      setBack('');
      onSuccess();
    } catch (e) {
      setIsLoading(false);
      alert('カードの追加に失敗しました');
    }
  };

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <div>
        <label className="block mb-1 font-medium">表面</label>
        <Textarea
          value={front}
          onChange={e => setFront(e.target.value)}
          placeholder="例）Memorize"
          className="min-h-[60px]"
        />
      </div>
      <div>
        <label className="block mb-1 font-medium">裏面</label>
        <Textarea
          value={back}
          onChange={e => setBack(e.target.value)}
          placeholder="例）記憶する、暗記する"
          className="min-h-[60px]"
        />
      </div>
      <Button type="submit" className="w-full" disabled={isLoading || !front || !back}>
        {isLoading ? (<><LoaderCircle className="mr-2 h-4 w-4 animate-spin" />追加中...</>) : 'カードを追加'}
      </Button>
    </form>
  );
} 