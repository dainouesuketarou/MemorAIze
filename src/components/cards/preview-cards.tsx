import { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { updateUsage } from '@/src/lib/store/slices/aiGenerationLimitSlice';
import { Button } from '@/src/components/ui/button';
import { Card, CardContent } from '@/src/components/ui/card';
import {
  Save,
  Edit2,
  Trash2,
  Volume2,
  Star,
  AlertCircle,
  RefreshCw,
  LoaderCircle,
  Tag,
} from 'lucide-react';
import { cn } from '@/src/lib/utils';
import { Input } from '@/src/components/ui/input';
import { speak, extractPlainText } from '@/src/lib/speech';
import { Textarea } from '@/src/components/ui/textarea';
import { toast } from '@/src/components/ui/toast';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/src/components/ui/dialog';
import { MathRenderer } from '@/src/components/common/MathRenderer';
import { MathText } from '@/src/components/common/MathText';
import { Group } from '@prisma/client';
import { FormLabel } from '@/src/components/ui/form';
import { Badge } from '@/src/components/ui/badge';

interface PreviewCard {
  id: string;
  front: string;
  back: string;
}

interface PreviewCardsProps {
  title?: string;
  cards: PreviewCard[];
  onSave: () => Promise<void>;
  isSaving: boolean;
  onCardsChange: (cards: PreviewCard[]) => void;
  onRegenerate?: (additionalInstructions: string) => Promise<PreviewCard[]>;
  onClose?: () => void;
  groups: Group[];
  selectedGroupIds: string[];
  onGroupIdsChange: (groupIds: string[]) => void;
}

export function PreviewCards({
  title,
  cards: initialCards,
  onSave,
  isSaving,
  onRegenerate,
  onCardsChange,
  onClose,
  groups,
  selectedGroupIds,
  onGroupIdsChange,
}: PreviewCardsProps) {
  const [cards, setCards] = useState<PreviewCard[]>(initialCards || []);
  const [editingCardId, setEditingCardId] = useState<string | null>(null);
  const [editedCard, setEditedCard] = useState<PreviewCard | null>(null);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [additionalInstructions, setAdditionalInstructions] = useState('');

  const dispatch = useDispatch();

  useEffect(() => {
    if (JSON.stringify(initialCards) !== JSON.stringify(cards)) {
      setCards(initialCards);
    }
  }, [initialCards]);

  const commit = (next: PreviewCard[]) => {
    setCards(next);
    onCardsChange(next);
  };

  const handleEdit = (card: PreviewCard) => {
    setEditingCardId(card.id);
    setEditedCard({ ...card });
  };

  const handleDelete = (id: string) => {
    const updatedCards = cards.filter((c) => c.id !== id);
    commit(updatedCards);

    if (updatedCards.length === 0 && onClose) {
      onClose();
    }
  };

  const handleSaveEdit = () => {
    if (!editedCard) return;
    const updatedCards = cards.map((c) =>
      c.id === editedCard.id ? editedCard : c,
    );
    commit(updatedCards);
    setEditingCardId(null);
    setEditedCard(null);
  };

  const handleCancelEdit = () => {
    setEditingCardId(null);
    setEditedCard(null);
  };

  const handleRegenerate = async () => {
    if (!onRegenerate) return;
    setIsRegenerating(true);
    try {
      dispatch(updateUsage({ monthlyUsage: 1 }));

      const response = await fetch('/api/cards/refresh', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          cards: cards.map(({ front, back }) => ({ front, back })),
          additionalInstructions,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'カードの改善に失敗しました');
      }

      const data = await response.json();
      if (!data.success || !data.data?.cards?.length) {
        throw new Error('カードの改善に失敗しました');
      }

      commit(data.data.cards);
      toast({
        title: 'カードを改善しました',
        description: 'AIによってカードの内容が改善されました。',
      });
      setDialogOpen(false);
      setAdditionalInstructions('');
    } catch (e: any) {
      toast({
        title: 'エラーが発生しました',
        description: e.message,
        variant: 'destructive',
      });
    } finally {
      setIsRegenerating(false);
    }
  };

  return (
    <>
      <div className="space-y-6 h-[calc(100vh-100px)] overflow-y-auto pr-2">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between sticky top-0 bg-background z-10 p-4 gap-4 sm:gap-0 border-b">
          <h2 className="text-xl sm:text-2xl font-bold">{title}</h2>
          <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                {/* 選択されたグループの表示 */}
                <div className="flex items-center gap-3 bg-muted/50 px-4 py-2 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Tag className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">選択された分野</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {groups
                      .filter((group) => selectedGroupIds.includes(group.id))
                      .map((group) => (
                        <Badge
                          key={group.id}
                          variant="secondary"
                          className="bg-background hover:bg-background/80 transition-colors"
                        >
                          {group.name}
                        </Badge>
                      ))}
                  </div>
                </div>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleRegenerate}
                disabled={isRegenerating}
              >
                {isRegenerating ? (
                  <>
                    <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
                    再生成中...
                  </>
                ) : (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4" />
                    ブラッシュアップ
                  </>
                )}
              </Button>
            </div>
            <Button
              onClick={onSave}
              disabled={isSaving}
              className="flex items-center justify-center gap-2 w-full sm:w-auto"
            >
              <Save className="h-4 w-4" />
              <span className="whitespace-nowrap">
                {isSaving ? '保存中...' : '保存する'}
              </span>
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pb-4">
          {cards.map((card) => (
            <Card
              key={card.id}
              className="p-4 group hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1"
            >
              <div className="relative">
                <div className="absolute top-0 right-0 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 hover:bg-primary/10"
                    onClick={() => handleEdit(card)}
                  >
                    <Edit2 className="h-4 w-4 text-muted-foreground" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 hover:bg-destructive/10"
                    onClick={() => handleDelete(card.id)}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>

                <div className="pt-12">
                  {editingCardId === card.id ? (
                    <div className="space-y-4">
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-sm font-medium text-primary bg-primary/10 px-2 py-0.5 rounded">
                            表
                          </span>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => speak(extractPlainText(card.front))}
                          >
                            <Volume2 className="h-4 w-4 text-muted-foreground" />
                          </Button>
                        </div>
                        <Textarea
                          value={editedCard?.front}
                          onChange={(e) =>
                            setEditedCard((prev) =>
                              prev ? { ...prev, front: e.target.value } : null,
                            )
                          }
                          className="min-h-[80px]"
                        />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-sm font-medium text-primary bg-primary/10 px-2 py-0.5 rounded">
                            裏
                          </span>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => speak(extractPlainText(card.back))}
                          >
                            <Volume2 className="h-4 w-4 text-muted-foreground" />
                          </Button>
                        </div>
                        <Textarea
                          value={editedCard?.back}
                          onChange={(e) =>
                            setEditedCard((prev) =>
                              prev ? { ...prev, back: e.target.value } : null,
                            )
                          }
                          className="min-h-[80px]"
                        />
                      </div>
                      <div className="flex gap-2">
                        <Button onClick={handleSaveEdit} className="flex-1">
                          保存
                        </Button>
                        <Button
                          variant="outline"
                          onClick={handleCancelEdit}
                          className="flex-1"
                        >
                          キャンセル
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="mb-4">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-sm font-medium text-primary bg-primary/10 px-2 py-0.5 rounded">
                            表
                          </span>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => speak(extractPlainText(card.front))}
                          >
                            <Volume2 className="h-4 w-4 text-muted-foreground" />
                          </Button>
                        </div>
                        <div className="text-lg font-medium break-words max-w-xl mx-auto overflow-x-auto">
                          <MathText text={card.front} />
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
                            onClick={() => speak(extractPlainText(card.back))}
                          >
                            <Volume2 className="h-4 w-4 text-muted-foreground" />
                          </Button>
                        </div>
                        <div className="text-lg font-medium break-words max-w-xl mx-auto overflow-x-auto">
                          <MathText text={card.back} />
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent
          className="sm:max-w-lg"
          aria-describedby="refresh-dialog-description"
        >
          <DialogHeader>
            <DialogTitle>カードをブラッシュアップ</DialogTitle>
            <DialogDescription id="refresh-dialog-description">
              追加の指示を入力して、カードの内容を改善できます。
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <label className="text-sm font-medium">追加指示</label>
            <Textarea
              value={additionalInstructions}
              onChange={(e) => setAdditionalInstructions(e.target.value)}
              placeholder="例）「より簡潔に」「例文を追加して」など"
              className="min-h-[100px]"
            />
          </div>

          <DialogFooter>
            <Button
              onClick={handleRegenerate}
              disabled={isRegenerating}
              className="flex items-center gap-2"
            >
              {isRegenerating && (
                <LoaderCircle className={cn('h-4 w-4 animate-spin')} />
              )}
              {isRegenerating ? '再生成中...' : '再生成'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
