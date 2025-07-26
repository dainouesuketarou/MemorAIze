import { useState, useEffect, useCallback } from 'react';
import { FilterMode } from '@prisma/client';

export type DeckSetting = {
  autoSpeak: boolean;
  reverse: boolean;
  filterMode: FilterMode[];
  shuffle: boolean;
};

// deckId が変わるまで保存関数は再利用される
export function useDeckSetting(deckId: string) {
  const [setting, setSetting] = useState<DeckSetting | null>(null);

  const refresh = useCallback(async () => {
    const res = await fetch(`/api/decks/${deckId}/settings`);
    const json = await res.json();
    setSetting(
      json.data ?? {
        autoSpeak: false,
        reverse: false,
        filterMode: ['UNLEARNED', 'MASTERED', 'STRUGGLING', 'FAVORITE'],
        shuffle: false,
      },
    );
  }, [deckId]);

  const save = useCallback(
    async (update: Partial<DeckSetting>) => {
      const res = await fetch(`/api/decks/${deckId}/settings`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(update),
      });
      const json = await res.json();
      setSetting(json.data);
    },
    [deckId],
  );

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { setting, save, refresh };
}
