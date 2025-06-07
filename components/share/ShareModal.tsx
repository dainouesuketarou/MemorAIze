// components/share/ShareModal.tsx

import React, { useEffect, useState } from 'react';
import { DeckCard } from './DeckCard';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { Sparkles, Trash2 } from 'lucide-react';
import { ImportDeckButton } from '../deck/ImportDeckButton';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/lib/store/store';
// import { Subscription } from '@prisma/client'; // ここは削除またはコメントアウト
import { setSubscription } from '@/lib/store/slices/userSlice';
import { Button } from '../ui/button';

// userSlice.ts から直接型をインポートすることを強く推奨します
// これにより、型の重複定義と不一致を防げます
import { Subscription as ReduxSubscriptionType } from '@/lib/store/slices/userSlice';

interface Deck {
  id: string;
  title: string;
  description?: string | null;
  cardCount: number;
  groups?: { name: string }[];
  shareCode?: string | null;
}

interface ShareModalProps {
  open: boolean;
  onClose: () => void;
}

export const ShareModal: React.FC<ShareModalProps> = ({ open, onClose }) => {
  const [myDecks, setMyDecks] = useState<Deck[]>([]);
  const [loading, setLoading] = useState(false);
  const [importCode, setImportCode] = useState('');
  const [importing, setImporting] = useState(false);
  const [importedDecks, setImportedDecks] = useState<Deck[]>([]);
  const [importLoading, setImportLoading] = useState<string | null>(null);
  const router = useRouter();

  const subscription = useSelector(
    (state: RootState) => state.user.subscription,
  );
  const dispatch = useDispatch();

  useEffect(() => {
    if (!open) return;
    setLoading(true);
    fetch('/api/decks')
      .then((res) => res.json())
      .then((data) => {
        setMyDecks(data);
        setLoading(false);
      })
      .catch(() => {
        toast.error('暗記帳の取得に失敗しました');
        setLoading(false);
      });
    setImportedDecks([]);
    setImportCode('');

    const fetchSubscription = async () => {
      try {
        const subscriptionResponse = await fetch('/api/subscription/status');
        if (!subscriptionResponse.ok) {
          throw new Error('サブスクリプション情報の取得に失敗しました');
        }

        // ここで ReduxSubscriptionType を使用
        const subscriptionData: ReduxSubscriptionType =
          await subscriptionResponse.json();

        // Reduxの状態を更新
        dispatch(setSubscription(subscriptionData));
      } catch (error) {
        console.error('サブスクリプション情報の取得に失敗しました:', error);
      }
    };

    fetchSubscription();
  }, [open, dispatch]);

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
        setImportedDecks((prev) => [data.data, ...prev]);
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
      setImportedDecks((prev) => prev.filter((deck) => deck.id !== deckId));
      toast.success('インポートした暗記帳を削除しました');
    } catch {
      toast.error('削除に失敗しました');
    } finally {
      setImportLoading(null);
    }
  };

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30">
      <div className="bg-white rounded-xl shadow-lg w-full max-w-4xl flex flex-col md:flex-row p-2 sm:p-6 relative mx-2 sm:mx-0">
        <button
          className="absolute top-2 right-2 sm:top-4 sm:right-4 text-gray-400 hover:text-gray-600"
          onClick={onClose}
          aria-label="閉じる"
        >
          ×
        </button>
        {/* 左：自分のDeckリスト */}
        <div className="w-full md:w-1/2 md:pr-4 border-b md:border-b-0 md:border-r border-gray-100 overflow-y-auto max-h-[60vh] md:max-h-[70vh] pb-4 md:pb-0">
          <h2 className="text-base sm:text-lg font-semibold mb-2 sm:mb-4">
            自分の暗記帳一覧
          </h2>
          {loading ? (
            <div className="text-gray-400 py-8 text-center">読み込み中...</div>
          ) : myDecks.length === 0 ? (
            <div className="text-gray-400 py-8 text-center">
              暗記帳がありません
            </div>
          ) : (
            myDecks.map((deck) => (
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
            <h2 className="text-base sm:text-lg font-semibold mb-2">
              暗記帳をインポート
            </h2>
            <div className="flex flex-col sm:flex-row gap-2">
              <input
                className="border rounded px-3 py-2 flex-1 min-w-0"
                placeholder="共有IDを入力"
                value={importCode}
                onChange={(e) => setImportCode(e.target.value)}
                disabled={importing}
              />
              {subscription?.plan === 'FREE' ? (
                <Button
                  variant="outline"
                  onClick={() => router.push('/subscription')}
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
            <h3 className="text-md font-semibold mb-2">インポート済み暗記帳</h3>
            {importedDecks.length === 0 ? (
              <div className="text-gray-400 py-8 text-center">
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
                    className="ml-auto mt-2 flex items-center text-red-500 hover:text-red-700 text-xs px-2 py-1 border border-red-200 rounded"
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
