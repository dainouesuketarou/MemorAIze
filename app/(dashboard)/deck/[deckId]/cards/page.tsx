'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { DashboardHeader } from '@/components/dashboard/header';
import { DashboardShell } from '@/components/dashboard/shell';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  Book,
  Home,
  Plus,
  Trash2,
  Edit2,
  Volume2,
  Star,
  AlertCircle,
} from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { Deck, Group } from '@prisma/client';
import { DeckWithCardsAndGroups } from '@/types/deck';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
  DialogDescription,
} from '@/components/ui/dialog';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { CardAddAiForm } from '@/components/cards/card-add-ai-form';
import { CardAddManualForm } from '@/components/cards/card-add-manual-form';
import { CardEditForm } from '@/components/cards/card-edit-form';
import { DeckEditForm } from '@/components/decks/deck-edit-form';
import { toast } from 'sonner';
import { speak } from '@/lib/speech';
import { MathRenderer } from '@/components/common/MathRenderer';

export default function CardsPage() {
  const router = useRouter();
  const { deckId } = useParams();

  const [groups, setGroups] = useState<Group[]>([]);
  const [decks, setDecks] = useState<DeckWithCardsAndGroups[]>([]);
  const [groupMode, setGroupMode] = useState(false);
  const [cards, setCards] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [tab, setTab] = useState<'ai' | 'manual'>('ai');
  const [editingCard, setEditingCard] = useState<any>(null);
  const [deckEditModalOpen, setDeckEditModalOpen] = useState(false);
  const [currentDeck, setCurrentDeck] = useState<any>(null);

  useEffect(() => {
    fetch('/api/groups')
      .then((res) => res.json())
      .then(setGroups);
    fetch('/api/decks')
      .then((res) => res.json())
      .then((data) => {
        setDecks(
          data.map((deck: any) => ({
            ...deck,
            cards: deck.cards || [],
          })),
        );
      });
  }, []);

  useEffect(() => {
    if (!deckId) return;
    setLoading(true);
    fetch(`/api/decks/${deckId}`).then(async (res) => {
      if (!res.ok) {
        setCards([]);
        setLoading(false);
        return;
      }
      const text = await res.text();
      if (!text) {
        setCards([]);
        setLoading(false);
        return;
      }
      const deck = JSON.parse(text);
      setCards(deck.cards || []);
      setLoading(false);
    });
  }, []);

  const handleCardAddSuccess = async () => {
    if (!deckId) return;
    setLoading(true);
    const res = await fetch(`/api/decks/${deckId}`);
    if (res.ok) {
      const text = await res.text();
      if (text) {
        const deck = JSON.parse(text);
        setCards(deck.cards || []);
      }
    }
    setLoading(false);
    setModalOpen(false);
  };

  const handleCardDelete = async (cardId: string) => {
    if (!confirm('このカードを削除してもよろしいですか？')) return;
    try {
      const response = await fetch(`/api/cards/${cardId}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error();
      toast.success('カードを削除しました');
      handleCardAddSuccess();
    } catch {
      toast.error('エラーが発生しました');
    }
  };

  const handleCardEdit = (card: any) => {
    setEditingCard(card);
  };

  const handleCardEditSuccess = () => {
    setEditingCard(null);
    handleCardAddSuccess();
  };

  const handleDeckEditSuccess = async () => {
    setDeckEditModalOpen(false);
    if (!deckId) return;
    const res = await fetch(`/api/decks/${deckId}`);
    if (res.ok) setCurrentDeck(await res.json());
  };

  return (
    <DashboardShell
      groups={groups}
      decks={decks}
      setDecks={setDecks}
      groupMode={groupMode}
      setGroupMode={setGroupMode}
    >
      <DashboardHeader
        heading={<div className="flex items-center gap-2">カード一覧</div>}
        description="暗記カードの管理と編集を行います"
      >
        <div className="flex gap-2">
          <Link href="/dashboard">
            <Button variant="outline">
              <Home className="mr-2 h-4 w-4" />
              ホームへ戻る
            </Button>
          </Link>
          <Link href={`/study/${deckId}`}>
            <Button>
              <Book className="mr-2 h-4 w-4" />
              学習開始
            </Button>
          </Link>
        </div>
      </DashboardHeader>

      <div className="grid gap-6">
        {loading ? (
          <div className="text-center text-muted-foreground py-10">
            カードを取得中...
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {cards.map((card) => (
              <Card
                key={card.id}
                className={cn(
                  'p-4 group hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1',
                  card.status === 'MASTERED' &&
                    'bg-primary/5 border-primary/20',
                  card.status === 'STRUGGLING' &&
                    'bg-destructive/5 border-destructive/20',
                )}
              >
                <div className="relative">
                  <div className="absolute top-0 right-0 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 hover:bg-primary/10"
                      onClick={() => handleCardEdit(card)}
                    >
                      <Edit2 className="h-4 w-4 text-muted-foreground" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 hover:bg-destructive/10"
                      onClick={() => handleCardDelete(card.id)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>

                  <div className="pt-12">
                    {card.status === 'MASTERED' && (
                      <div className="absolute top-2 left-0">
                        <div className="flex items-center gap-1 text-primary">
                          <Star className="h-4 w-4 fill-primary" />
                          <span className="text-sm font-medium">覚えた</span>
                        </div>
                      </div>
                    )}
                    {card.status === 'STRUGGLING' && (
                      <div className="absolute top-2 left-0">
                        <div className="flex items-center gap-1 text-destructive">
                          <AlertCircle className="h-4 w-4 fill-destructive" />
                          <span className="text-sm font-medium">苦手</span>
                        </div>
                      </div>
                    )}

                    <div className="mb-4">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-sm font-medium text-primary bg-primary/10 px-2 py-0.5 rounded">
                          表
                        </span>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => speak(card.front)}
                        >
                          <Volume2 className="h-4 w-4 text-muted-foreground" />
                        </Button>
                      </div>
                      <div className="text-lg font-medium break-words">
                        <MathRenderer text={card.front} />
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-sm font-medium text-primary bg-primary/10 px-2 py-0.5 rounded">
                          裏
                        </span>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => speak(card.back)}
                        >
                          <Volume2 className="h-4 w-4 text-muted-foreground" />
                        </Button>
                      </div>
                      <div className="text-lg font-medium break-words">
                        <MathRenderer text={card.back} />
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            ))}

            <button
              type="button"
              className="block w-full"
              onClick={() => setModalOpen(true)}
            >
              <Card className="p-4 h-full flex items-center justify-center border-2 border-dashed hover:border-primary hover:bg-primary/5 transition-all duration-300 transform hover:-translate-y-1 cursor-pointer">
                <div className="text-center">
                  <div className="bg-primary/10 rounded-full p-3 mb-3 inline-block">
                    <Plus className="h-8 w-8 text-primary" />
                  </div>
                  <p className="text-primary font-medium">新しいカードを追加</p>
                </div>
              </Card>
            </button>
          </div>
        )}
      </div>

      {/* カード追加モーダル */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>新しいカードを追加</DialogTitle>
            <DialogDescription>
              暗記カードをAIで生成するか、手動で作成できます。
            </DialogDescription>
          </DialogHeader>
          <Tabs
            defaultValue={tab}
            onValueChange={(v) => setTab(v as 'ai' | 'manual')}
            className="w-full"
          >
            <TabsList className="grid grid-cols-2 w-full max-w-md mb-6 mx-auto">
              <TabsTrigger value="ai">AIで生成</TabsTrigger>
              <TabsTrigger value="manual">手動で作成</TabsTrigger>
            </TabsList>
            <TabsContent value="ai">
              <CardAddAiForm deckId={deckId} onSuccess={handleCardAddSuccess} />
            </TabsContent>
            <TabsContent value="manual">
              <CardAddManualForm
                deckId={deckId}
                onSuccess={handleCardAddSuccess}
              />
            </TabsContent>
          </Tabs>
          <DialogClose asChild>
            <Button variant="outline" className="w-full mt-4">
              閉じる
            </Button>
          </DialogClose>
        </DialogContent>
      </Dialog>

      {/* カード編集モーダル */}
      <Dialog open={!!editingCard} onOpenChange={() => setEditingCard(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>カードを編集</DialogTitle>
            <DialogDescription>
              カードの表裏の内容を編集できます。
            </DialogDescription>
          </DialogHeader>
          {editingCard && (
            <CardEditForm
              cardId={editingCard.id}
              initialFront={editingCard.front}
              initialBack={editingCard.back}
              onSuccess={handleCardEditSuccess}
              onCancel={() => setEditingCard(null)}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* デッキ編集モーダル */}
      <Dialog open={deckEditModalOpen} onOpenChange={setDeckEditModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>デッキ設定</DialogTitle>
            <DialogDescription>
              デッキのタイトルと説明を編集できます。
            </DialogDescription>
          </DialogHeader>
          {currentDeck && (
            <DeckEditForm
              deckId={deckId as string}
              initialTitle={currentDeck.title}
              initialDescription={currentDeck.description}
              onSuccess={handleDeckEditSuccess}
            />
          )}
        </DialogContent>
      </Dialog>
    </DashboardShell>
  );
}
