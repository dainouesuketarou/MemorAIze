'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { DashboardShell } from '@/components/dashboard/shell';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Star, Volume2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Deck, Group } from '@prisma/client';

export default function StudyPage() {
  const { deckId } = useParams();
  const router = useRouter();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [masteredCount, setMasteredCount] = useState(0);
  const [cards, setCards] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [groups, setGroups] = useState<Group[]>([]);
  const [decks, setDecks] = useState<(Deck & { groups: Group[] })[]>([]);
  const [groupMode, setGroupMode] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [studyResults, setStudyResults] = useState<{ id: string, mastered: boolean }[]>([]);

  useEffect(() => {
    fetch('/api/groups').then(res => res.json()).then(setGroups);
    fetch('/api/decks').then(res => res.json()).then(setDecks);
  }, []);

  useEffect(() => {
    if (!deckId) return;
    setLoading(true);
    fetch(`/api/decks/${deckId}`)
      .then(async res => {
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
  }, [deckId]);

  const totalCards = cards.length;
  const currentCard = cards[currentIndex];
  const progress = totalCards > 0 ? (currentIndex / totalCards) * 100 : 0;

  const handleNext = async (finalResult?: boolean) => {
    if (currentIndex < cards.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setShowAnswer(false);
    } else {
      setIsTransitioning(true);
      setCurrentIndex(currentIndex + 1);
      setShowAnswer(false);
      // 最後のカードの結果もstudyResultsに追加
      let finalResults = studyResults;
      if (typeof finalResult === 'boolean' && currentCard) {
        finalResults = [...studyResults, { id: currentCard.id, mastered: finalResult }];
      }
      console.log(finalResults);
      await fetch(`/api/study/${deckId}/result`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ results: finalResults }),
      });
      onStudyComplete();
      setTimeout(() => {
        router.push(`/deck/${deckId}`);
      }, 400);
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      setShowAnswer(false);
    }
  };

  const handleCorrect = () => {
    if (currentIndex < cards.length - 1) {
      setStudyResults(prev => ([...prev, { id: currentCard.id, mastered: true }]));
      setMasteredCount(prev => Math.min(prev + 1, totalCards));
      handleNext();
    } else {
      setMasteredCount(prev => Math.min(prev + 1, totalCards));
      handleNext(true);
    }
  };

  const handleIncorrect = () => {
    if (currentIndex < cards.length - 1) {
      setStudyResults(prev => ([...prev, { id: currentCard.id, mastered: false }]));
      setMasteredCount(prev => Math.max(prev - 1, 0));
      handleNext();
    } else {
      setMasteredCount(prev => Math.max(prev - 1, 0));
      handleNext(false);
    }
  };

  const handleCardClick = () => setShowAnswer((prev) => !prev);

  const handleCardDrag = (e: React.DragEvent) => {
    if (e.clientX < window.innerWidth / 2) {
      // 左にドラッグ→不正解
      handleIncorrect();
    } else {
      // 右にドラッグ→正解
      handleCorrect();
    }
  };

  const handleStudyComplete = async (progress: number) => {
    try {
      const response = await fetch(`/api/study/${deckId}/history`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ progress }),
      });

      if (!response.ok) {
        throw new Error('学習履歴の記録に失敗しました');
      }

      // 学習完了後の処理（例：ダッシュボードに戻る）
      router.push(`/deck/${deckId}`);
    } catch (error) {
      console.error('学習履歴の記録エラー:', error);
      // エラー処理（例：トースト通知など）
    }
  };

  // 学習完了時の処理
  const onStudyComplete = () => {
    // 進捗率の計算（例：正解率に基づく）
    const progress = Math.round(((masteredCount + 1) / totalCards) * 100);
    handleStudyComplete(progress);
  };

  if (loading) {
    return (
      <DashboardShell
        groups={groups}
        decks={decks}
        setDecks={setDecks}
        groupMode={groupMode}
        setGroupMode={setGroupMode}
      >
        <div className="flex items-center justify-center h-[80vh] text-lg text-muted-foreground">
          カードを取得中...
        </div>
      </DashboardShell>
    );
  }

  if (!currentCard && isTransitioning) {
    return (
      <DashboardShell
        groups={groups}
        decks={decks}
        setDecks={setDecks}
        groupMode={groupMode}
        setGroupMode={setGroupMode}
      >
        <div className="flex flex-col items-center min-h-[80vh] max-w-5xl mx-auto">
          <div className="w-full mb-8">
            <div className="flex justify-between items-center mb-2">
              <div className="flex items-center gap-2">
                <Star className="h-5 w-5 text-primary" />
                <span className="font-medium">{cards.length}</span>
                <span className="text-muted-foreground">/</span>
                <span className="text-muted-foreground">{cards.length}</span>
              </div>
            </div>
            <div className="h-2 rounded-full overflow-hidden bg-muted">
              <div
                className="h-full bg-primary transition-all duration-300"
                style={{ width: `100%` }}
              />
            </div>
          </div>
        </div>
      </DashboardShell>
    );
  }

  if (!currentCard) {
    return (
      <DashboardShell
        groups={groups}
        decks={decks}
        setDecks={setDecks}
        groupMode={groupMode}
        setGroupMode={setGroupMode}
      >
        <div className="flex items-center justify-center h-[80vh]">
          <Card className="p-6">
            <p className="text-lg">カードが見つかりません</p>
          </Card>
        </div>
      </DashboardShell>
    );
  }

  return (
    <DashboardShell
      groups={groups}
      decks={decks}
      setDecks={setDecks}
      groupMode={groupMode}
      setGroupMode={setGroupMode}
    >
      <div className="flex flex-col items-center min-h-[80vh] max-w-5xl mx-auto">
        {/* Progress bar and stats */}
        <div className="w-full mb-8">
          <div className="flex justify-between items-center mb-2">
            <div className="flex items-center gap-2">
              <Star className="h-5 w-5 text-primary" />
              <span className="font-medium">{currentIndex}</span>
              <span className="text-muted-foreground">/</span>
              <span className="text-muted-foreground">{totalCards}</span>
            </div>
            <Button 
              variant="outline" 
              onClick={() => router.push('/dashboard')}
              className="rounded-full px-6"
            >
              終了
            </Button>
          </div>
          <div className="h-2 rounded-full overflow-hidden bg-muted">
            <div 
              className="h-full bg-primary transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Main card area */}
        <div className="w-full relative">
          <div className="grid grid-cols-[120px_1fr_120px] gap-4 h-[500px]">
            {/* Left button */}
            <Button
              variant="ghost"
              className={cn(
                "h-full writing-mode-vertical rounded-xl font-bold text-lg",
                showAnswer
                  ? "bg-red-500 hover:bg-red-600 text-white"
                  : "bg-gray-300 hover:bg-gray-400 text-gray-700"
              )}
              onClick={handleIncorrect}
            >
              {showAnswer ? '不正解' : '分からない'}
            </Button>

            {/* Card content */}
            <Card
              className="relative flex items-center justify-center p-8 cursor-pointer select-none"
              onClick={handleCardClick}
              draggable
              onDragEnd={handleCardDrag}
            >
              <div className="absolute top-4 left-4">
                <Star className="h-6 w-6 text-gray-200" />
              </div>
              <div className="absolute top-4 right-4">
                <Button variant="ghost" size="icon" className="rounded-full">
                  <Volume2 className="h-6 w-6" />
                </Button>
              </div>
              <div className="text-4xl font-bold text-center">
                {showAnswer ? currentCard.back : currentCard.front}
              </div>
            </Card>

            {/* Right button */}
            <Button
              variant="ghost"
              className={cn(
                "h-full writing-mode-vertical rounded-xl font-bold text-lg",
                showAnswer
                  ? "bg-green-500 hover:bg-green-600 text-white"
                  : "bg-blue-500 hover:bg-blue-600 text-white"
              )}
              onClick={showAnswer ? handleCorrect : () => setShowAnswer(true)}
            >
              {showAnswer ? '正解' : '答え'}
            </Button>
          </div>

          {/* Navigation buttons */}
          <div className="flex justify-between mt-8">
            <Button
              variant="outline"
              size="lg"
              className="w-32 rounded-full"
              onClick={handlePrevious}
              disabled={currentIndex === 0}
            >
              戻る
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="w-32 rounded-full"
              onClick={() => handleNext()}
              disabled={currentIndex === cards.length - 1}
            >
              進む
            </Button>
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}