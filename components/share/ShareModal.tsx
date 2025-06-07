// components/share/ShareModal.tsx

import React, { useState } from 'react';
import { DeckCard } from './DeckCard';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { Sparkles, Trash2 } from 'lucide-react';
import { ImportDeckButton } from '../deck/ImportDeckButton';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/lib/store/store';
import { Button } from '../ui/button';
import {
  setImportedDecks,
  removeImportedDeck,
} from '@/lib/store/slices/importedDeckSlice';

interface ShareModalProps {
  open: boolean;
  onClose: () => void;
}

export const ShareModal: React.FC<ShareModalProps> = ({ open, onClose }) => {
  const [importCode, setImportCode] = useState('');
  const [importing, setImporting] = useState(false);
  const [importLoading, setImportLoading] = useState<string | null>(null);
  const router = useRouter();

  const dispatch = useDispatch();
  const subscription = useSelector(
    (state: RootState) => state.user.subscription,
  );
  const decks = useSelector((state: RootState) => state.deck.decks);
  const importedDecks = useSelector(
    (state: RootState) => state.importedDeck.decks,
  );

  const handleImport = async () => {
    if (!importCode.trim()) {
      toast.error('共有IDを入力してください');
      return;
    }
    setImporting(true);
    try {
      const res = await fetch('/api/decks/share', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ shareCode: importCode.trim() }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || 'インポートに失敗しました');
      } else {
        dispatch(setImportedDecks([data.data, ...importedDecks]));
        toast.success('暗記帳をインポートしました');
        setImportCode('');
      }
    } catch (e) {
      toast.error('インポートに失敗しました');
    } finally {
      setImporting(false);
    }
  };

  const handleDeleteImported = async (deckId: string) => {
    setImportLoading(deckId);
    try {
      const res = await fetch(`/api/decks/${deckId}`, { method: 'DELETE' });
      if (!res.ok) throw new Error();
      dispatch(removeImportedDeck(deckId));
      toast.success('インポートした暗記帳を削除しました');
    } catch {
      toast.error('削除に失敗しました');
    } finally {
      setImportLoading(null);
    }
  };

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
      <div className="bg-background border rounded-xl shadow-lg w-full max-w-4xl flex flex-col md:flex-row p-2 sm:p-6 relative mx-2 sm:mx-0">
        <button
          className="absolute top-2 right-2 sm:top-4 sm:right-4 text-muted-foreground hover:text-foreground transition-colors"
          onClick={onClose}
          aria-label="閉じる"
        >
          ×
        </button>
        {/* 左：自分のDeckリスト */}
        <div className="w-full md:w-1/2 md:pr-4 border-b md:border-b-0 md:border-r border-border overflow-y-auto max-h-[60vh] md:max-h-[70vh] pb-4 md:pb-0">
          <h2 className="text-base sm:text-lg font-semibold mb-2 sm:mb-4 text-foreground">
            自分の暗記帳一覧
          </h2>
          {decks.length === 0 ? (
            <div className="text-muted-foreground py-8 text-center">
              暗記帳がありません
            </div>
          ) : (
            decks.map((deck) => (
              <DeckCard
                key={deck.id}
                title={deck.title}
                description={deck.description}
                cardCount={deck.cardCount}
                groups={deck.groups}
                shareCode={deck.shareCode}
                onCopyShareCode={(code) =>
                  toast.success(`共有ID「${code}」をコピーしました`)
                }
              />
            ))
          )}
        </div>
        {/* 右：ID入力バー＋importボタン＋import済みDeckリスト */}
        <div className="w-full md:w-1/2 md:pl-4 flex flex-col mt-4 md:mt-0">
          <div className="mb-4 sm:mb-6">
            <h2 className="text-base sm:text-lg font-semibold mb-2 text-foreground">
              暗記帳をインポート
            </h2>
            <div className="flex flex-col sm:flex-row gap-2">
              <input
                className="border border-input rounded-md px-3 py-2 flex-1 min-w-0 bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                placeholder="共有IDを入力"
                value={importCode}
                onChange={(e) => setImportCode(e.target.value)}
                disabled={importing}
              />
              {subscription?.plan === 'FREE' ? (
                <Button
                  variant="outline"
                  onClick={() => router.push('/subscription')}
                  className="gap-2"
                >
                  <Sparkles className="h-4 w-4" />
                  <span>アップグレードしてインポート</span>
                </Button>
              ) : (
                <ImportDeckButton onImport={handleImport} />
              )}
            </div>
          </div>
          <div className="flex-1 overflow-y-auto">
            <h3 className="text-md font-semibold mb-2 text-foreground">
              インポート済み暗記帳
            </h3>
            {importedDecks.length === 0 ? (
              <div className="text-muted-foreground py-8 text-center">
                まだインポートしていません
              </div>
            ) : (
              importedDecks.map((deck) => (
                <DeckCard
                  key={deck.id}
                  title={deck.title}
                  description={deck.description}
                  cardCount={deck.cardCount}
                  groups={deck.groups}
                  shareCode={deck.shareCode}
                  onClick={() => router.push(`/dashboard/deck/${deck.id}`)}
                >
                  <button
                    className="ml-auto mt-2 flex items-center text-destructive hover:text-destructive/90 text-xs px-2 py-1 border border-destructive/20 rounded-md transition-colors"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteImported(deck.id);
                    }}
                    disabled={importLoading === deck.id}
                  >
                    {importLoading === deck.id ? (
                      '削除中...'
                    ) : (
                      <>
                        <Trash2 size={14} className="mr-1" />
                        削除
                      </>
                    )}
                  </button>
                </DeckCard>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
