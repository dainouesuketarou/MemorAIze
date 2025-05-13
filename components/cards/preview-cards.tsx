import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Save, Edit2, Trash2, Volume2, Star, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

interface PreviewCard {
  id: string;
  front: string;
  back: string;
}

interface PreviewCardsProps {
  title: string;
  cards: PreviewCard[];
  onSave: () => Promise<void>;
  isSaving: boolean;
}

export function PreviewCards({ title, cards: initialCards, onSave, isSaving }: PreviewCardsProps) {
  const [cards, setCards] = useState(initialCards);
  const [editingCardId, setEditingCardId] = useState<string | null>(null);
  const [editedCard, setEditedCard] = useState<PreviewCard | null>(null);

  const handleEdit = (card: PreviewCard) => {
    setEditingCardId(card.id);
    setEditedCard({ ...card });
  };

  const handleDelete = (cardId: string) => {
    setCards(cards.filter(card => card.id !== cardId));
  };

  const handleSaveEdit = () => {
    if (!editedCard) return;
    setCards(cards.map(card => 
      card.id === editedCard.id ? editedCard : card
    ));
    setEditingCardId(null);
    setEditedCard(null);
  };

  const handleCancelEdit = () => {
    setEditingCardId(null);
    setEditedCard(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">{title}</h2>
        <Button 
          onClick={onSave} 
          disabled={isSaving}
          className="flex items-center gap-2"
        >
          <Save className="h-4 w-4" />
          {isSaving ? '保存中...' : '保存する'}
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {cards.map((card) => (
          <Card 
            key={card.id} 
            className="p-4 group hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1"
          >
            <div className="relative">
              <div className="absolute top-0 right-0 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-primary/10">
                  <Volume2 className="h-4 w-4 text-muted-foreground" />
                </Button>
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
                        <span className="text-sm font-medium text-primary bg-primary/10 px-2 py-0.5 rounded">表</span>
                      </div>
                      <Textarea
                        value={editedCard?.front}
                        onChange={(e) => setEditedCard(prev => prev ? { ...prev, front: e.target.value } : null)}
                        className="min-h-[80px]"
                      />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-sm font-medium text-primary bg-primary/10 px-2 py-0.5 rounded">裏</span>
                      </div>
                      <Textarea
                        value={editedCard?.back}
                        onChange={(e) => setEditedCard(prev => prev ? { ...prev, back: e.target.value } : null)}
                        className="min-h-[80px]"
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button onClick={handleSaveEdit} className="flex-1">保存</Button>
                      <Button variant="outline" onClick={handleCancelEdit} className="flex-1">キャンセル</Button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="mb-4">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-sm font-medium text-primary bg-primary/10 px-2 py-0.5 rounded">表</span>
                      </div>
                      <p className="text-lg font-medium">{card.front}</p>
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-sm font-medium text-primary bg-primary/10 px-2 py-0.5 rounded">裏</span>
                      </div>
                      <p className="text-lg font-medium">{card.back}</p>
                    </div>
                  </>
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
} 