'use client';

import { useEffect, useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Card, CardContent } from '@/components/ui/card';
import { LoaderCircle, MinusCircle, PlusCircle, Save, X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Badge } from '@/components/ui/badge';
import { Group } from '@prisma/client';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { useDispatch } from 'react-redux';
import { addDeck } from '@/lib/store/slices/deckSlice';

// Form schema for the deck
const deckFormSchema = z.object({
  title: z
    .string()
    .min(2, {
      message: '暗記カード帳のタイトルを入力してください。',
    })
    .max(50, {
      message: 'タイトルは50文字以内で入力してください。',
    }),
  description: z
    .string()
    .max(1000, {
      message: '説明は1000文字以内で入力してください。',
    })
    .optional(),
});

// Form schema for individual cards
const cardFormSchema = z.object({
  front: z
    .string()
    .min(1, { message: '表面のテキストを入力してください。' })
    .max(100, { message: '表面は100文字以内で入力してください。' }),
  back: z
    .string()
    .min(1, { message: '裏面のテキストを入力してください。' })
    .max(100, { message: '裏面は100文字以内で入力してください。' }),
});

type CardType = {
  id: string;
  front: string;
  back: string;
  isNew?: boolean;
};

interface ManualCreateFormProps {
  groups: Group[];
}

export function ManualCreateForm({ groups }: ManualCreateFormProps) {
  const router = useRouter();
  const dispatch = useDispatch();
  const [cards, setCards] = useState<CardType[]>([
    { id: '1', front: '', back: '', isNew: true },
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentCardId, setCurrentCardId] = useState('1');
  const [selectedGroupIds, setSelectedGroupIds] = useState<string[]>([]);

  useEffect(() => {
    if (groups.length > 0) {
      setSelectedGroupIds([groups[0].id]);
    }
  }, [groups]);

  // Form for deck information
  const deckForm = useForm<z.infer<typeof deckFormSchema>>({
    resolver: zodResolver(deckFormSchema),
    defaultValues: {
      title: '',
      description: '',
    },
  });

  // Form for current card
  const cardForm = useForm<z.infer<typeof cardFormSchema>>({
    resolver: zodResolver(cardFormSchema),
    defaultValues: {
      front: '',
      back: '',
    },
  });

  const addNewCard = () => {
    // Save current card first
    const { front, back } = cardForm.getValues();
    if (front && back) {
      // 両方のフィールドが入力されている場合のみ保存
      setCards((prevCards) =>
        prevCards.map((card) =>
          card.id === currentCardId
            ? { ...card, front, back, isNew: false }
            : card,
        ),
      );

      const newId = Date.now().toString();
      const newCard = { id: newId, front: '', back: '', isNew: true };
      setCards((prevCards) => [...prevCards, newCard]);
      setCurrentCardId(newId);

      // Reset card form
      cardForm.reset({
        front: '',
        back: '',
      });
    } else {
      // 入力が不完全な場合はエラーメッセージを表示
      if (!front) {
        cardForm.setError('front', {
          type: 'manual',
          message: '表面を入力してください',
        });
      }
      if (!back) {
        cardForm.setError('back', {
          type: 'manual',
          message: '裏面を入力してください',
        });
      }
    }
  };

  const selectCard = (cardId: string) => {
    // Save current card before switching
    const { front, back } = cardForm.getValues();
    if (front && back) {
      // 両方のフィールドが入力されている場合のみ保存
      setCards((prevCards) =>
        prevCards.map((card) =>
          card.id === currentCardId
            ? { ...card, front, back, isNew: false }
            : card,
        ),
      );
    }

    // Set the selected card
    setCurrentCardId(cardId);

    // Find the selected card and populate the form
    const selectedCard = cards.find((card) => card.id === cardId);
    if (selectedCard) {
      cardForm.reset({
        front: selectedCard.front,
        back: selectedCard.back,
      });
    }
  };

  const removeCard = (cardId: string) => {
    if (cards.length <= 1) {
      return; // Don't remove the last card
    }

    const remainingCards = cards.filter((card) => card.id !== cardId);
    setCards(remainingCards);

    // If the current card is removed, select another card
    if (currentCardId === cardId) {
      const newCurrentId = remainingCards[0]?.id || '';
      setCurrentCardId(newCurrentId);

      const newCurrentCard = remainingCards.find(
        (card) => card.id === newCurrentId,
      );
      if (newCurrentCard) {
        cardForm.reset({
          front: newCurrentCard.front,
          back: newCurrentCard.back,
        });
      }
    }
  };

  const onSubmit = async (values: z.infer<typeof deckFormSchema>) => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/decks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: values.title,
          description: values.description,
          cards: cards.map(({ front, back }) => ({ front, back })),
        }),
      });

      if (!res.ok) {
        throw new Error('暗記帳の作成に失敗しました');
      }

      const data = await res.json();

      // ReduxのStateを更新
      dispatch(addDeck(data));

      toast.success('暗記帳を作成しました');
      router.push('/dashboard');
    } catch (error) {
      toast.error('暗記帳の作成に失敗しました');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Deck Information Form */}
      <Form {...deckForm}>
        <form className="space-y-4">
          <FormField
            control={deckForm.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>暗記カード帳のタイトル</FormLabel>
                <FormControl>
                  <Input
                    placeholder="例）英検準一級英単語"
                    maxLength={50}
                    {...field}
                  />
                </FormControl>
                <FormDescription>50文字以内で入力してください</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={deckForm.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>説明（オプション）</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="このカード帳の内容や目的などを記入してください"
                    className="h-20"
                    maxLength={1000}
                    {...field}
                  />
                </FormControl>
                <FormDescription>
                  1000文字以内で入力してください
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* グループ選択 */}
          <div className="space-y-4">
            <FormLabel className="text-base">分野（複数選択可）</FormLabel>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {groups.map((group) => (
                <label
                  key={group.id}
                  className={cn(
                    'relative flex items-center justify-center p-3 rounded-lg border-2 cursor-pointer transition-all duration-200',
                    selectedGroupIds.includes(group.id)
                      ? 'border-primary bg-primary/5'
                      : 'border-muted-foreground/20 hover:border-primary/50',
                  )}
                >
                  <input
                    type="checkbox"
                    className="sr-only"
                    checked={selectedGroupIds.includes(group.id)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedGroupIds((prev) => [...prev, group.id]);
                      } else {
                        setSelectedGroupIds((prev) =>
                          prev.filter((id) => id !== group.id),
                        );
                      }
                    }}
                  />
                  <span
                    className={cn(
                      'text-sm font-medium',
                      selectedGroupIds.includes(group.id)
                        ? 'text-primary'
                        : 'text-muted-foreground',
                    )}
                  >
                    {group.name}
                  </span>
                </label>
              ))}
            </div>
          </div>
        </form>
      </Form>

      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-medium">カード ({cards.length}枚)</h3>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={addNewCard}
          >
            <PlusCircle className="mr-2 h-4 w-4" />
            カードを追加
          </Button>
        </div>

        {/* Card list */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-60 overflow-y-auto p-2">
          {cards.map((card, index) => (
            <Card
              key={card.id}
              className={`hover:shadow-md transition-shadow cursor-pointer ${
                currentCardId === card.id ? 'border-primary' : ''
              }`}
              onClick={() => selectCard(card.id)}
            >
              <CardContent className="p-4 flex justify-between items-start">
                <div className="w-full overflow-hidden">
                  <div className="font-medium truncate">
                    {card.front || '(表面未入力)'}
                  </div>
                  <div className="text-sm text-muted-foreground truncate mt-1">
                    {card.back || '(裏面未入力)'}
                  </div>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    removeCard(card.id);
                  }}
                  className="ml-2"
                >
                  <X className="h-4 w-4 text-muted-foreground" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Current card editing form */}
        <Form {...cardForm}>
          <form className="space-y-4 p-4 border rounded-lg">
            <h4 className="font-medium">カード編集</h4>

            <FormField
              control={cardForm.control}
              name="front"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>表面</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="例）Memorize"
                      className="h-20"
                      maxLength={100}
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    100文字以内で入力してください
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={cardForm.control}
              name="back"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>裏面</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="例）記憶する、暗記する"
                      className="h-20"
                      maxLength={100}
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    100文字以内で入力してください
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </form>
        </Form>
      </div>

      <Button
        onClick={() => deckForm.handleSubmit(onSubmit)()}
        className="w-full"
        disabled={isLoading}
      >
        {isLoading ? (
          <>
            <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
            保存中...
          </>
        ) : (
          '暗記カード帳を保存'
        )}
      </Button>
    </div>
  );
}
