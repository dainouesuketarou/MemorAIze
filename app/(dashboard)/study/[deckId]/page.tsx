'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Star, Volume2, Cog } from 'lucide-react';
import { cn } from '@/lib/utils';
import { FilterMode } from '@prisma/client';
import { speakFrontOrBack, extractPlainText, speak } from '@/lib/speech';
import { SettingModal } from '@/components/study/SettingModal';
import { useDeckSetting } from '@/hooks/useDeckSetting';
import { toast } from 'sonner';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '@/lib/store/store';
import {
  saveProgress,
  clearProgress,
} from '@/lib/store/slices/studyProgressSlice';
import { updateDeckProgress } from '@/lib/store/slices/deckSlice';
import { AnyAction } from '@reduxjs/toolkit';
import { MathRenderer } from '@/components/common/MathRenderer';
import { MathText } from '@/components/common/MathText';
import { HeaderNav } from '@/components/dashboard/header-nav';
import {
  fetchDeckCardsIfNeeded,
  updateCardStatus,
  toggleFavorite,
} from '@/lib/store/slices/studySlice';

/* ------------ 型 ------------ */
type CardType = {
  id: string;
  front: string;
  back: string;
  status: 'UNLEARNED' | 'MASTERED' | 'STRUGGLING';
  favorite: boolean;
};

type DragState = {
  isDragging: boolean;
  direction: 'left' | 'right' | null;
  offset: number;
  rotation: number;
  scale: number;
  opacity: number;
};

type TouchPosition = {
  clientX: number;
  clientY: number;
};

/* ============================ */
export default function StudyPage() {
  const { deckId } = useParams();
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const studyProgress = useSelector(
    (state: RootState) => state.studyProgress.progress[deckId as string],
  );

  /* ---------- 全体状態 ---------- */
  const [groupMode, setGroupMode] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  /* ---------- カード ---------- */
  const {
    cards: reduxCards,
    isLoading,
    stats: reduxStats,
  } = useSelector((state: RootState) => state.study);
  const [cards, setCards] = useState<CardType[]>([]);
  const [currentIndex, setCurrentIndex] = useState(
    studyProgress?.currentIndex ?? 0,
  );
  const [showAnswer, setShowAnswer] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const [masteredCount, setMasteredCount] = useState(0);
  const [studyResults, setStudyResults] = useState<
    { id: string; mastered: boolean }[]
  >([]);

  /* ---------- 設定 ---------- */
  const { setting, save } = useDeckSetting(deckId as string);
  const [settingOpen, setSettingOpen] = useState(false);
  const prevSettingRef = useRef<typeof setting | null>(null);

  /* ---------- 統計 (チェックボックス活性制御用) ---------- */
  const [stats, setStats] = useState<Record<FilterMode, number>>({
    UNLEARNED: 0,
    MASTERED: 0,
    STRUGGLING: 0,
    FAVORITE: 0,
  });

  const [dragState, setDragState] = useState<DragState>({
    isDragging: false,
    direction: null,
    offset: 0,
    rotation: 0,
    scale: 1,
    opacity: 1,
  });
  const dragTimeoutRef = useRef<NodeJS.Timeout>();
  const touchStartPosRef = useRef<TouchPosition | null>(null);

  // スクロールイベント
  useEffect(() => {
    let ticking = false;
    const onScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          setScrolled(window.scrollY > 10);
          ticking = false;
        });
        ticking = true;
      }
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  /* ============ デッキ取得 ============ */
  useEffect(() => {
    if (!deckId || Array.isArray(deckId)) return;
    dispatch(fetchDeckCardsIfNeeded(deckId));
  }, [deckId, dispatch]);

  /* ============ 設定反映 ============ */
  useEffect(() => {
    if (!setting || !reduxCards.length) return;
    let list = [...reduxCards];

    if (setting.filterMode.length) {
      const sel = new Set(setting.filterMode);
      list = list.filter((c) => {
        if (sel.has('UNLEARNED') && c.status === 'UNLEARNED') return true;
        if (sel.has('MASTERED') && c.status === 'MASTERED') return true;
        if (sel.has('STRUGGLING') && c.status === 'STRUGGLING') return true;
        if (sel.has('FAVORITE') && c.favorite) return true;
        return false;
      });
    }

    if (list.length === 0) {
      if (
        prevSettingRef.current &&
        setting.filterMode.join() !== prevSettingRef.current.filterMode.join()
      ) {
        toast.warning('その組み合わせでは学習できるカードがありません');
        save({ filterMode: prevSettingRef.current.filterMode });
      }
      return;
    }

    if (setting.shuffle) list.sort(() => Math.random() - 0.5);

    const prev = prevSettingRef.current;
    const needReset =
      !prev ||
      prev.shuffle !== setting.shuffle ||
      prev.filterMode.sort().join() !== setting.filterMode.sort().join();

    setCards(list);
    if (needReset) {
      setCurrentIndex(0);
      setShowAnswer(false);
    }
    prevSettingRef.current = setting;
  }, [setting, reduxCards, save]);

  /* ============ 音声読み上げの初期化 ============ */
  useEffect(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      speechSynthesis.getVoices();
    }
  }, []);

  /* ============ 自動音声 ============ */
  useEffect(() => {
    const cur = cards[currentIndex];
    if (setting?.autoSpeak && cur) {
      speakFrontOrBack(cur, showAnswer, setting.reverse);
    }
  }, [currentIndex, showAnswer, setting, cards]);

  /* ============ 補助値 ============ */
  const totalCards = cards.length;
  const currentCard = cards[currentIndex];
  const progress = totalCards ? (currentIndex / totalCards) * 100 : 0;
  const front = currentCard
    ? setting?.reverse
      ? currentCard.back
      : currentCard.front
    : '';
  const back = currentCard
    ? setting?.reverse
      ? currentCard.front
      : currentCard.back
    : '';

  /* ============ 進む/戻る/判定 ============ */
  const next = () => {
    if (currentIndex < totalCards - 1) {
      setCurrentIndex((i) => i + 1);
      setShowAnswer(false);
    }
  };
  const prev = () => {
    if (currentIndex > 0) {
      setCurrentIndex((i) => i - 1);
      setShowAnswer(false);
    }
  };

  /* ====== 正解/不正解/学習完了（元実装を保持） ====== */
  const handleCorrect = () => {
    if (currentIndex >= totalCards - 1 && isTransitioning) return;

    const cardId = currentCard.id;
    dispatch(updateCardStatus({ cardId, status: 'MASTERED' }));
    setStudyResults((prev) => [...prev, { id: cardId, mastered: true }]);
    setMasteredCount((p) => Math.min(p + 1, totalCards));

    if (currentIndex < totalCards - 1) {
      next();
    } else {
      handleNext(true);
    }
  };

  const handleIncorrect = () => {
    if (currentIndex >= totalCards - 1 && isTransitioning) return;

    const cardId = currentCard.id;
    dispatch(updateCardStatus({ cardId, status: 'STRUGGLING' }));
    setStudyResults((prev) => [...prev, { id: cardId, mastered: false }]);
    setMasteredCount((p) => Math.max(p - 1, 0));

    if (currentIndex < totalCards - 1) {
      next();
    } else {
      handleNext(false);
    }
  };

  /* ====== 結果送信 & 完了 ====== */
  const handleNext = async (finalResult?: boolean) => {
    if (currentIndex >= totalCards - 1 && isTransitioning) return;
    if (currentIndex < totalCards - 1) {
      next();
    } else {
      setIsTransitioning(true);
      next();

      // 最後の1枚の結果を含めた結果を準備
      let finalResults = studyResults;
      if (typeof finalResult === 'boolean' && currentCard) {
        finalResults = [
          ...studyResults,
          { id: currentCard.id, mastered: finalResult },
        ];
      }

      try {
        // 学習結果を保存
        const resultResponse = await fetch(`/api/study/${deckId}/result`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ results: finalResults }),
        });

        if (!resultResponse.ok) {
          throw new Error('学習結果の保存に失敗しました');
        }

        // 学習履歴を保存
        // 正解したカードの割合を計算
        const correctCount = finalResults.filter((r) => r.mastered).length;
        const progressPercentage = Math.round(
          (correctCount / totalCards) * 100,
        );

        const historyResponse = await fetch(`/api/study/${deckId}/history`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            progress: progressPercentage,
            completedAt: new Date().toISOString(),
            totalCards,
            correctCount,
            incorrectCount: totalCards - correctCount,
          }),
        });

        if (!historyResponse.ok) {
          throw new Error('学習履歴の保存に失敗しました');
        }

        // Reduxの状態を更新
        dispatch(
          updateDeckProgress({
            deckId: deckId as string,
            progress: progressPercentage,
          }) as unknown as AnyAction,
        );
        dispatch(clearProgress(deckId as string));

        // 少し待ってからリダイレクト（ローディング表示のため）
        setTimeout(() => {
          router.push(`/deck/${deckId}`);
        }, 1000);
      } catch (error) {
        console.error('学習データの保存に失敗しました:', error);
        toast.error('学習データの保存に失敗しました');
        setIsTransitioning(false);
      }
    }
  };

  /* ============ ドラッグ ============ */
  const handleDrag = useCallback(
    (clientX: number, clientY: number) => {
      if (!dragState.isDragging || !touchStartPosRef.current) return;

      const offsetX = clientX - touchStartPosRef.current.clientX;
      const offsetY = clientY - touchStartPosRef.current.clientY;
      const direction = offsetX < 0 ? 'left' : 'right';
      const absOffset = Math.abs(offsetX);
      const maxOffset = 200;

      // 回転角度の計算（最大15度に抑制）
      const rotation = (offsetX / maxOffset) * 15;

      // スケールの計算（より控えめに）
      const scale = 1 - (absOffset / maxOffset) * 0.05;

      // 不透明度の計算（より控えめに）
      const opacity = 1 - (absOffset / maxOffset) * 0.1;

      // 状態更新をスロットリング
      if (dragTimeoutRef.current) {
        clearTimeout(dragTimeoutRef.current);
      }

      dragTimeoutRef.current = setTimeout(() => {
        setDragState((prev) => ({
          ...prev,
          direction,
          offset: Math.min(Math.max(offsetX, -maxOffset), maxOffset),
          rotation,
          scale,
          opacity,
        }));
      }, 16);
    },
    [dragState.isDragging],
  );

  const handleDragStart = useCallback((clientX: number, clientY: number) => {
    touchStartPosRef.current = { clientX, clientY };
    setDragState({
      isDragging: true,
      direction: null,
      offset: 0,
      rotation: 0,
      scale: 1,
      opacity: 1,
    });
  }, []);

  const handleDragEnd = useCallback(() => {
    if (!dragState.isDragging) return;

    // タイムアウトをクリア
    if (dragTimeoutRef.current) {
      clearTimeout(dragTimeoutRef.current);
    }

    const threshold = 100;
    if (Math.abs(dragState.offset) > threshold) {
      // アニメーション付きでカードをスワイプアウト
      setDragState((prev) => ({
        ...prev,
        offset:
          prev.direction === 'left' ? -window.innerWidth : window.innerWidth,
        opacity: 0,
      }));

      // アニメーション完了後に判定を実行
      setTimeout(() => {
        if (dragState.direction === 'left') {
          handleIncorrect();
        } else {
          handleCorrect();
        }
        // 状態をリセット
        setDragState({
          isDragging: false,
          direction: null,
          offset: 0,
          rotation: 0,
          scale: 1,
          opacity: 1,
        });
        touchStartPosRef.current = null;
      }, 300);
    } else {
      // スワイプが不十分な場合は元の位置に戻る
      setDragState({
        isDragging: false,
        direction: null,
        offset: 0,
        rotation: 0,
        scale: 1,
        opacity: 1,
      });
      touchStartPosRef.current = null;
    }
  }, [
    dragState.isDragging,
    dragState.direction,
    dragState.offset,
    handleIncorrect,
    handleCorrect,
  ]);

  // クリーンアップ
  useEffect(() => {
    return () => {
      if (dragTimeoutRef.current) {
        clearTimeout(dragTimeoutRef.current);
      }
    };
  }, []);

  /* ============ 再スタート用ハンドラ ============ */
  const handleRestart = () => {
    setCurrentIndex(0);
    setShowAnswer(false);
  };

  /* ============ ローディング / 0枚 ============ */
  if (isLoading || isTransitioning)
    return (
      <div className="min-h-screen flex flex-col">
        <HeaderNav
          groupMode={groupMode}
          setGroupMode={setGroupMode}
          scrolled={scrolled}
        />
        <main className="flex-1 flex flex-col items-center justify-center">
          <div className="flex flex-col items-center justify-center h-[80vh] gap-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            <p className="text-lg text-muted-foreground">
              {isTransitioning ? '学習結果を保存中...' : 'カードを取得中...'}
            </p>
          </div>
        </main>
      </div>
    );
  if (!currentCard)
    return (
      <div className="min-h-screen flex flex-col">
        <HeaderNav
          groupMode={groupMode}
          setGroupMode={setGroupMode}
          scrolled={scrolled}
        />
        <main className="flex-1 flex items-center justify-center">
          <Card className="p-6">
            <p className="text-lg">カードが見つかりません</p>
          </Card>
        </main>
      </div>
    );

  /* ============ 画面 ============ */
  return (
    <div className="min-h-screen flex flex-col">
      <HeaderNav
        groupMode={groupMode}
        setGroupMode={setGroupMode}
        scrolled={scrolled}
      />
      <main className="flex-1">
        {/* ヘッダー部分 */}
        <div className="w-full mb-4 sm:mb-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-2">
            <div className="flex items-center gap-2">
              <span className="font-medium">{currentIndex + 1}</span>
              <span className="text-muted-foreground">/</span>
              <span className="text-muted-foreground">{totalCards}</span>
            </div>
            <div className="flex items-center gap-2">
              <Button
                onClick={() => setSettingOpen(true)}
                variant="ghost"
                size="icon"
              >
                <Cog className="h-6 w-6" />
              </Button>
              <Button
                variant="outline"
                onClick={() => router.push('/dashboard')}
                className="rounded-full px-4 sm:px-6"
              >
                終了
              </Button>
              <Button
                variant="outline"
                onClick={handleRestart}
                className="rounded-full px-4 sm:px-6"
              >
                再スタート
              </Button>
            </div>
          </div>
          <div className="h-2 rounded-full overflow-hidden bg-muted">
            <div
              className="h-full bg-primary transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* カード部分 */}
        <style>{cardFlipStyles}</style>
        <div className="w-full relative">
          <div className="flex flex-col sm:grid sm:grid-cols-[120px_1fr_120px] gap-4 min-h-[400px] sm:h-[500px]">
            {/* PC表示時の左ボタン */}
            <Button
              variant="ghost"
              className={cn(
                'hidden sm:block h-full writing-mode-vertical rounded-xl font-bold text-lg',
                showAnswer
                  ? 'bg-red-500 hover:bg-red-600 text-white'
                  : 'bg-gray-300 hover:bg-gray-400 text-gray-700',
              )}
              onClick={handleIncorrect}
            >
              {showAnswer ? '不正解' : '分からない'}
            </Button>

            {/* カード本体 */}
            <div
              className={cn(
                'relative flex-1 study-flip-card',
                showAnswer && 'flipped',
              )}
              style={{ minHeight: '300px', height: '100%' }}
              onClick={() => setShowAnswer((p) => !p)}
              onTouchStart={(e) => {
                const touch = e.touches[0];
                handleDragStart(touch.clientX, touch.clientY);
              }}
              onTouchMove={(e) => {
                const touch = e.touches[0];
                handleDrag(touch.clientX, touch.clientY);
              }}
              onTouchEnd={() => handleDragEnd()}
              onMouseDown={(e) => {
                handleDragStart(e.clientX, e.clientY);
              }}
              onMouseMove={(e) => {
                handleDrag(e.clientX, e.clientY);
              }}
              onMouseUp={() => handleDragEnd()}
              onMouseLeave={() => handleDragEnd()}
            >
              <div
                className="study-flip-inner"
                style={{ width: '100%', height: '100%' }}
              >
                {/* 表 */}
                <Card
                  className={cn(
                    'study-flip-front relative flex items-center justify-center p-4 sm:p-8 cursor-pointer select-none min-h-[300px] sm:min-h-[500px] transition-all duration-200 touch-none',
                    dragState.isDragging && 'cursor-grabbing',
                  )}
                  style={{
                    transformOrigin: 'center center',
                    boxShadow: dragState.isDragging
                      ? '0 10px 20px rgba(0, 0, 0, 0.15)'
                      : '0 4px 6px rgba(0, 0, 0, 0.1)',
                    height: '100%',
                  }}
                >
                  {/* ドラッグ中の方向インジケーター */}
                  {dragState.isDragging && (
                    <div
                      className={cn(
                        'absolute inset-0 rounded-lg transition-opacity duration-200',
                        dragState.direction === 'left'
                          ? 'bg-red-500/20'
                          : dragState.direction === 'right'
                          ? 'bg-green-500/20'
                          : 'bg-transparent',
                      )}
                    />
                  )}
                  <div className="absolute top-2 right-2 sm:top-4 sm:right-4">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="rounded-full"
                      onClick={(e) => {
                        e.stopPropagation();
                        speak(extractPlainText(front));
                      }}
                    >
                      <Volume2 className="h-5 w-5 sm:h-6 sm:w-6" />
                    </Button>
                  </div>
                  <div className="text-2xl sm:text-4xl font-bold text-center break-words px-4 max-w-xl mx-auto">
                    <MathText text={front} />
                  </div>
                </Card>
                {/* 裏 */}
                <Card
                  className={cn(
                    'study-flip-back relative flex items-center justify-center p-4 sm:p-8 cursor-pointer select-none min-h-[300px] sm:min-h-[500px] transition-all duration-200 touch-none',
                    dragState.isDragging && 'cursor-grabbing',
                  )}
                  style={{
                    transformOrigin: 'center center',
                    boxShadow: dragState.isDragging
                      ? '0 10px 20px rgba(0, 0, 0, 0.15)'
                      : '0 4px 6px rgba(0, 0, 0, 0.1)',
                    height: '100%',
                  }}
                >
                  <div className="absolute top-2 right-2 sm:top-4 sm:right-4">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="rounded-full"
                      onClick={(e) => {
                        e.stopPropagation();
                        speak(extractPlainText(back));
                      }}
                    >
                      <Volume2 className="h-5 w-5 sm:h-6 sm:w-6" />
                    </Button>
                  </div>
                  <div className="text-2xl sm:text-4xl font-bold text-center break-words px-4 max-w-xl mx-auto">
                    <MathText text={back} />
                  </div>
                </Card>
              </div>
            </div>

            {/* PC表示時の右ボタン */}
            <Button
              variant="ghost"
              className={cn(
                'hidden sm:block h-full writing-mode-vertical rounded-xl font-bold text-lg',
                showAnswer
                  ? 'bg-green-500 hover:bg-green-600 text-white'
                  : 'bg-blue-500 hover:bg-blue-600 text-white',
              )}
              onClick={showAnswer ? handleCorrect : () => setShowAnswer(true)}
            >
              {showAnswer ? '正解' : '答え'}
            </Button>
          </div>

          {/* スマホ表示時のボタン */}
          <div className="sm:hidden flex flex-col gap-4 mt-4">
            <div className="grid grid-cols-2 gap-4">
              <Button
                variant="ghost"
                className={cn(
                  'h-12 rounded-xl font-bold text-lg',
                  showAnswer
                    ? 'bg-red-500 hover:bg-red-600 text-white'
                    : 'bg-gray-300 hover:bg-gray-400 text-gray-700',
                )}
                onClick={handleIncorrect}
              >
                {showAnswer ? '不正解' : '分からない'}
              </Button>
              <Button
                variant="ghost"
                className={cn(
                  'h-12 rounded-xl font-bold text-lg',
                  showAnswer
                    ? 'bg-green-500 hover:bg-green-600 text-white'
                    : 'bg-blue-500 hover:bg-blue-600 text-white',
                )}
                onClick={showAnswer ? handleCorrect : () => setShowAnswer(true)}
              >
                {showAnswer ? '正解' : '答え'}
              </Button>
            </div>
          </div>

          {/* 戻る／進むボタン */}
          <div className="flex justify-between mt-4 sm:mt-8 px-2 sm:px-0">
            <Button
              variant="outline"
              size="lg"
              className="w-28 sm:w-32 rounded-full"
              onClick={prev}
              disabled={currentIndex === 0}
            >
              戻る
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="w-28 sm:w-32 rounded-full"
              onClick={() => {
                if (currentIndex >= totalCards - 1) {
                  handleNext(undefined);
                } else {
                  next();
                }
              }}
            >
              スキップ
            </Button>
          </div>
        </div>

        {/* 設定モーダル */}
        {setting && (
          <SettingModal
            open={settingOpen}
            onOpenChange={setSettingOpen}
            value={setting}
            stats={stats}
            onSave={save}
          />
        )}
      </main>
    </div>
  );
}

/* カードフリップ用CSS（UI・レイアウトは変更しない）
.study-flip-card {
  perspective: 1200px;
}
.study-flip-inner {
  transition: transform 0.5s cubic-bezier(0.4,0.2,0.2,1);
  transform-style: preserve-3d;
  position: relative;
  width: 100%;
  height: 100%;
}
.study-flip-card.flipped .study-flip-inner {
  transform: rotateY(180deg);
}
.study-flip-front, .study-flip-back {
  backface-visibility: hidden;
  position: absolute;
  width: 100%;
  height: 100%;
  top: 0; left: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}
.study-flip-back {
  transform: rotateY(180deg);
}
*/

const cardFlipStyles = `
  .study-flip-card {
    perspective: 1200px;
  }
  .study-flip-inner {
    transition: transform 0.5s cubic-bezier(0.4,0.2,0.2,1);
    transform-style: preserve-3d;
    position: relative;
    width: 100%;
    height: 100%;
  }
  .study-flip-card.flipped .study-flip-inner {
    transform: rotateY(180deg);
  }
  .study-flip-front, .study-flip-back {
    backface-visibility: hidden;
    position: absolute;
    width: 100%;
    height: 100%;
    top: 0; left: 0;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
  }
  .study-flip-back {
    transform: rotateY(180deg);
  }
`;
