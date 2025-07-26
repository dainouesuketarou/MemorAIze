// components/dashboard/shell.tsx
'use client';

import { useEffect, useState, useMemo, useCallback } from 'react';
import { MainNav } from '@/src/components/dashboard/main-nav';
import { UserNav } from '@/src/components/dashboard/user-nav';
import { ThemeToggle } from '@/src/components/theme-toggle';
import {
  Bell,
  BadgeHelp as Help,
  Search,
  BookOpen,
  Clock,
  BarChart,
  Brain,
  AlertCircle,
} from 'lucide-react';
import { Input } from '@/src/components/ui/input';
import { cn } from '@/src/lib/utils';
import { DeckWithCardsAndGroups } from '@/src/types/deck';
import { useRouter, usePathname } from 'next/navigation';
import { AiLimitBadge } from '@/src/components/dashboard/ai-limit-badge';
import { Loading } from '../loading';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '@/src/lib/store/store';

interface DashboardShellProps {
  children: React.ReactNode;
  fullWidth?: boolean;
  groupMode: boolean;
  setGroupMode: React.Dispatch<React.SetStateAction<boolean>>;
}

interface AiGenerationLimit {
  count: number;
  limit: number;
}

// 相対時間を計算する関数
const getRelativeTime = (date: Date | string) => {
  const now = new Date();
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  const diff = now.getTime() - dateObj.getTime();
  const minutes = Math.floor(diff / (1000 * 60));
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  const months = Math.floor(days / 30);

  if (months > 0) return `${months}ヶ月前`;
  if (days > 0) return `${days}日前`;
  if (hours > 0) return `${hours}時間前`;
  if (minutes > 0) return `${minutes}分前`;
  return '今';
};

export function DashboardShell({
  children,
  fullWidth = false,
  groupMode,
  setGroupMode,
}: DashboardShellProps) {
  const dispatch = useDispatch<AppDispatch>();
  const [scrolled, setScrolled] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showResults, setShowResults] = useState(false);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();
  const isDashboardPage = pathname === '/dashboard';

  // Reduxの状態を取得
  const { decks, isLoading: decksLoading } = useSelector(
    (state: RootState) => state.deck,
  );
  const { isLoading: groupsLoading } = useSelector(
    (state: RootState) => state.group,
  );

  // 初期データの読み込みは不要（Reduxから取得）
  useEffect(() => {
    setLoading(false);
  }, []);

  // スクロールイベントの最適化
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

  // 検索結果のメモ化
  const filteredDecks = useMemo(() => {
    if (!searchQuery) return [];
    const query = searchQuery.toLowerCase();
    return decks.filter((deck: DeckWithCardsAndGroups) =>
      deck.title.toLowerCase().includes(query),
    );
  }, [decks, searchQuery]);

  // 検索ハンドラーの最適化
  const handleSearch = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);
    setShowResults(!!value);
  }, []);

  const handleSelect = useCallback(
    (deckId: string) => {
      setSearchQuery('');
      setShowResults(false);
      router.push(`/deck/${deckId}`);
    },
    [router],
  );

  // 検索結果のレンダリングを最適化
  const renderSearchResults = useMemo(() => {
    if (!showResults || !searchQuery) return null;

    return (
      <div className="absolute w-full mt-1 bg-background border rounded-md shadow-lg max-h-[400px] overflow-y-auto z-50">
        {filteredDecks.length > 0 ? (
          <div className="py-1">
            {filteredDecks.map((deck) => {
              const totalCards = deck.cards.length;
              const masteredCount = deck.cards.filter(
                (card) => card.status === 'MASTERED',
              ).length;
              const progress =
                totalCards > 0
                  ? Math.round((masteredCount / totalCards) * 100)
                  : 0;

              return (
                <button
                  key={deck.id}
                  onClick={() => handleSelect(deck.id)}
                  className="w-full px-4 py-3 text-left hover:bg-muted transition-colors"
                >
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{deck.title}</span>
                      <span className="text-xs text-muted-foreground">
                        {totalCards}枚のカード
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <BookOpen className="h-3 w-3" />
                        <span>
                          {deck.groups.length > 0
                            ? deck.groups.map((g) => g.name).join(', ')
                            : 'グループなし'}
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        <span>
                          {deck.lastStudied
                            ? `最終学習: ${getRelativeTime(
                                new Date(deck.lastStudied),
                              )}`
                            : '未学習'}
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <BarChart className="h-3 w-3" />
                        <span>進捗: {progress}%</span>
                      </div>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        ) : (
          <div className="px-4 py-2 text-sm text-muted-foreground">
            検索結果が見つかりませんでした
          </div>
        )}
      </div>
    );
  }, [filteredDecks, showResults, searchQuery, handleSelect]);

  return (
    <div className="min-h-screen flex flex-col">
      <header
        className={cn(
          'sticky top-0 z-40 w-full transition-all duration-200',
          scrolled
            ? 'bg-background/95 backdrop-blur-sm border-b'
            : 'bg-transparent',
        )}
      >
        <div className="max-w-7xl mx-auto flex h-16 items-center justify-between py-4 px-4 sm:px-6 lg:px-8 w-full">
          <MainNav groupMode={groupMode} setGroupMode={setGroupMode} />

          <div className="flex-1 justify-center px-4 lg:px-8">
            {isDashboardPage && (
              <div className="relative w-full max-w-md">
                <div className="hidden lg:block relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="search"
                    placeholder="暗記カード帳を検索..."
                    className="w-full pl-9 bg-muted"
                    value={searchQuery}
                    onChange={handleSearch}
                    onFocus={() => setShowResults(true)}
                  />
                </div>
                {renderSearchResults}
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
            {/* <Bell className="h-5 w-5 cursor-pointer text-muted-foreground hover:text-foreground transition-colors" /> */}
            <ThemeToggle />
            <UserNav />
          </div>
        </div>
      </header>

      <main className={cn('flex-1 py-8', fullWidth ? 'container-fluid' : '')}>
        <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 space-y-6">
          <AiLimitBadge />
          {loading || decksLoading || groupsLoading ? (
            <div className="flex items-center justify-center min-h-[400px]">
              <Loading />
            </div>
          ) : Array.isArray(children) ? (
            children.map((child, i) => <div key={i}>{child}</div>)
          ) : (
            <div>{children}</div>
          )}
        </div>
      </main>
    </div>
  );
}
