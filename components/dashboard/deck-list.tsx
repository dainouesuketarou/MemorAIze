'use client';

import { useState, useEffect } from 'react';
import { Deck, Group } from '@prisma/client';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Book, Clock, MoreHorizontal, Play } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogClose,
  DialogFooter,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

export interface DeckWithCardsAndGroups extends Deck {
  cards: { id: string; status: string }[];
  groups: Group[];
}

interface DeckListProps {
  decks: DeckWithCardsAndGroups[];
  groupMode: boolean;
  groups: Group[];
  setDecks: React.Dispatch<React.SetStateAction<DeckWithCardsAndGroups[]>>;
}

export function DeckList({
  decks,
  groupMode,
  groups,
  setDecks,
}: DeckListProps) {
  // タブ（進捗フィルタ）
  const [filter, setFilter] = useState<
    'all' | 'inProgress' | 'completed' | 'notStarted'
  >('all');
  // ソート
  const [sort, setSort] = useState<'recent' | 'alphabetical' | 'cardCount'>(
    'recent',
  );
  // 親から渡される decks を内部ステートで保持
  const [localDecks, setLocalDecks] = useState<DeckWithCardsAndGroups[]>(decks);
  // 分野モーダル用
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedDeck, setSelectedDeck] =
    useState<DeckWithCardsAndGroups | null>(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deckToDelete, setDeckToDelete] =
    useState<DeckWithCardsAndGroups | null>(null);
  const router = useRouter();

  // 親の decks が変わったら更新
  useEffect(() => {
    setLocalDecks(decks);
  }, [decks]);

  // モーダル内での分野付け替え
  const toggleDeckGroup = async (deckId: string, groupId: string) => {
    // 変更後のグループID配列を作成
    const targetDeck = localDecks.find((d) => d.id === deckId);
    if (!targetDeck) return;
    const hasGroup = targetDeck.groups.some((g) => g.id === groupId);
    const newGroupIds = hasGroup
      ? targetDeck.groups.filter((g) => g.id !== groupId).map((g) => g.id)
      : [...targetDeck.groups.map((g) => g.id), groupId];

    // APIでDBを更新
    try {
      const res = await fetch(`/api/decks/${deckId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ groupIds: newGroupIds }),
      });
      if (!res.ok) throw new Error('グループ更新失敗');
      // PATCH成功後に最新データを再取得
      const decksRes = await fetch('/api/decks');
      const updatedDecks = await decksRes.json();
      setDecks(updatedDecks);
      setLocalDecks(updatedDecks);
    } catch (e) {
      alert('グループの更新に失敗しました');
    }
  };

  // 進捗タブで絞り込み
  const filteredByProgress = localDecks.filter((deck) => {
    if (filter === 'all') return true;
    if (filter === 'inProgress') return deck.progress > 0 && deck.progress < 1;
    if (filter === 'completed') return deck.progress === 1;
    if (filter === 'notStarted') return deck.progress === 0;
    return true;
  });

  // ソート
  const sortedDecks = [...filteredByProgress].sort((a, b) => {
    if (sort === 'recent') {
      const bTime = b.lastStudied ? new Date(b.lastStudied).getTime() : 0;
      const aTime = a.lastStudied ? new Date(a.lastStudied).getTime() : 0;
      return bTime - aTime;
    }
    if (sort === 'alphabetical') {
      return a.title.localeCompare(b.title);
    }
    if (sort === 'cardCount') {
      return b.cardCount - a.cardCount;
    }
    return 0;
  });

  // 日付を相対表現
  const formatRelativeTime = (date: string | Date) => {
    const d = typeof date === 'string' ? new Date(date) : date;
    const diff = Date.now() - d.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    if (days === 0) return '今日';
    if (days === 1) return '昨日';
    if (days < 7) return `${days}日前`;
    if (days < 30) return `${Math.floor(days / 7)}週間前`;
    return `${Math.floor(days / 30)}ヶ月前`;
  };

  // モーダル内デッキ更新時に選択中デッキも同期
  useEffect(() => {
    if (selectedDeck) {
      const updated = localDecks.find((d) => d.id === selectedDeck.id);
      if (updated) setSelectedDeck(updated);
    }
  }, [localDecks, selectedDeck]);

  const handleDelete = async () => {
    if (!deckToDelete) return;

    try {
      const response = await fetch(`/api/decks/${deckToDelete.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete deck');
      }

      // 削除成功後、デッキリストを更新
      const updatedDecks = localDecks.filter(
        (deck) => deck.id !== deckToDelete.id,
      );
      setLocalDecks(updatedDecks);
      setDecks(updatedDecks);

      toast.success('暗記帳を削除しました');
      setDeleteModalOpen(false);
      setDeckToDelete(null);
    } catch (error) {
      toast.error('暗記帳の削除に失敗しました');
    }
  };

  return (
    <div className="space-y-6">
      {/* 進捗タブ + ソートメニュー */}
      <div className="flex justify-between items-center">
        <Tabs
          defaultValue={filter}
          onValueChange={(v: string) => setFilter(v as any)}
        >
          <TabsList>
            <TabsTrigger value="all">全て</TabsTrigger>
            <TabsTrigger value="inProgress">学習中</TabsTrigger>
            <TabsTrigger value="completed">完了</TabsTrigger>
            <TabsTrigger value="notStarted">未開始</TabsTrigger>
          </TabsList>
        </Tabs>
        <div className="flex gap-2 items-center">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                並び替え
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>並び替え</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => setSort('recent')}>
                最近の学習順
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSort('alphabetical')}>
                名前順
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSort('cardCount')}>
                カード数順
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* カードグリッド */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {sortedDecks.map((deck) => (
          <Card
            key={deck.id}
            className="hover:shadow-md transition-shadow cursor-pointer"
            onClick={() => {
              if (groupMode) {
                setSelectedDeck(deck);
                setModalOpen(true);
              }
            }}
          >
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg">{deck.title}</CardTitle>
                  <CardDescription className="line-clamp-2 mt-1">
                    {deck.description}
                  </CardDescription>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      className="h-8 w-8 p-0"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <MoreHorizontal className="h-6 w-6 text-muted-foreground" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedDeck(deck);
                        setModalOpen(true);
                      }}
                    >
                      グループ化
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={(e) => {
                        e.stopPropagation();
                        setDeckToDelete(deck);
                        setDeleteModalOpen(true);
                      }}
                      className="text-red-600"
                    >
                      削除
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
                <Book className="h-4 w-4" />
                <span>{deck.cardCount}枚のカード</span>
                {deck.lastStudied && (
                  <>
                    <Clock className="h-4 w-4 ml-2" />
                    <span>
                      最終学習日: {formatRelativeTime(deck.lastStudied)}
                    </span>
                  </>
                )}
              </div>
              {/* 学習進捗バーと割合表示 */}
              {deck.cards ? (
                (() => {
                  const totalCards = deck.cardCount;
                  const masteredCount = deck.cards.filter(
                    (card: { status: string }) => card.status === 'MASTERED',
                  ).length;
                  const strugglingCount = deck.cards.filter(
                    (card: { status: string }) => card.status === 'STRUGGLING',
                  ).length;
                  const unlearnedCount = deck.cards.filter(
                    (card: { status: string }) => card.status === 'UNLEARNED',
                  ).length;
                  const masteredPercentage =
                    totalCards > 0
                      ? Math.round((masteredCount / totalCards) * 100)
                      : 0;
                  const strugglingPercentage =
                    totalCards > 0
                      ? Math.round((strugglingCount / totalCards) * 100)
                      : 0;
                  const unlearnedPercentage =
                    totalCards > 0
                      ? Math.round((unlearnedCount / totalCards) * 100)
                      : 0;
                  return (
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>学習進捗</span>
                        <span>{masteredPercentage}%</span>
                      </div>
                      <div className="w-full h-4 bg-gray-200 rounded-full flex overflow-hidden">
                        <div
                          style={{ width: `${masteredPercentage}%` }}
                          className="bg-[#4ade80] h-4"
                        />
                        <div
                          style={{ width: `${strugglingPercentage}%` }}
                          className="bg-[#f87171] h-4"
                        />
                        <div
                          style={{ width: `${unlearnedPercentage}%` }}
                          className="bg-[#9ca3af] h-4"
                        />
                      </div>
                      <div className="flex justify-between text-xs mt-1">
                        <span className="text-[#4ade80]">
                          覚えた {masteredPercentage}%
                        </span>
                        <span className="text-[#f87171]">
                          苦手 {strugglingPercentage}%
                        </span>
                        <span className="text-[#9ca3af]">
                          未学習 {unlearnedPercentage}%
                        </span>
                      </div>
                    </div>
                  );
                })()
              ) : (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>学習進捗</span>
                    <span>0%</span>
                  </div>
                  <div className="w-full h-4 bg-gray-200 rounded-full" />
                  <div className="flex justify-between text-xs mt-1">
                    <span className="text-[#4ade80]">覚えた 0%</span>
                    <span className="text-[#f87171]">苦手 0%</span>
                    <span className="text-[#9ca3af]">未学習 0%</span>
                  </div>
                </div>
              )}
              <div className="flex flex-wrap gap-2 mt-4">
                {deck.groups.map((group) => (
                  <Badge key={group.id} variant="secondary">
                    {group.name}
                  </Badge>
                ))}
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Link href={`/deck/${deck.id}`} className="w-full">
                <Button className="w-full">
                  <Play className="mr-2 h-4 w-4" />
                  学習に進む
                </Button>
              </Link>
            </CardFooter>
          </Card>
        ))}
      </div>

      {/* 分野（グループ化）モーダル */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>分野（グループ）を選択</DialogTitle>
            <DialogDescription>
              この暗記帳が属する分野をチェックしてください。
            </DialogDescription>
          </DialogHeader>
          {selectedDeck && (
            <div className="flex flex-wrap gap-2">
              {groups.map((group) => {
                const checked = selectedDeck.groups.some(
                  (g) => g.id === group.id,
                );
                return (
                  <label key={group.id} className="cursor-pointer">
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() =>
                        toggleDeckGroup(selectedDeck.id, group.id)
                      }
                      className="hidden"
                    />
                    <span
                      className={`inline-block px-4 py-2 rounded select-none text-sm font-medium
                        ${
                          checked
                            ? 'bg-purple-200 text-purple-800'
                            : 'bg-gray-200 text-gray-500'
                        }
                        border border-transparent hover:border-purple-400`}
                      style={{ minWidth: 80, textAlign: 'center' }}
                    >
                      {group.name}
                    </span>
                  </label>
                );
              })}
            </div>
          )}
          <DialogClose asChild>
            <Button variant="outline" className="w-full mt-4">
              閉じる
            </Button>
          </DialogClose>
        </DialogContent>
      </Dialog>

      {/* 削除確認モーダル */}
      <Dialog open={deleteModalOpen} onOpenChange={setDeleteModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>暗記帳の削除</DialogTitle>
            <DialogDescription>
              この暗記帳を削除してもよろしいですか？この操作は取り消せません。
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteModalOpen(false)}>
              キャンセル
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              削除
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
