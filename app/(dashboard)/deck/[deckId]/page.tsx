'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { DashboardHeader } from '@/components/dashboard/header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Home, BookOpen, LineChart } from 'lucide-react';
import Link from 'next/link';
import {
  PieChart,
  Pie,
  Cell,
  LineChart as RechartsLineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { Deck, Group } from '@prisma/client';
import { DeckWithCardsAndGroups } from '@/types/deck';
import { Loading } from '@/components/loading';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { DeckEditForm } from '@/components/decks/deck-edit-form';
import { Edit2 } from 'lucide-react';
import { MathRenderer } from '@/components/common/MathRenderer';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '@/lib/store/store';
import { fetchDeckDetailsIfNeeded } from '@/lib/store/slices/deckSlice';
import { HeaderNav } from '@/components/dashboard/header-nav';

// 相対時間を計算する関数
const getRelativeTime = (dateString: string) => {
  const now = new Date();
  const date = new Date(dateString);
  const diff = now.getTime() - date.getTime();
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

interface StudyHistory {
  progress: number;
  createdAt: string;
}

export default function DeckDetailsPage() {
  const router = useRouter();
  const { deckId } = useParams();
  const dispatch = useDispatch<AppDispatch>();

  // 追加: DashboardShell用のstate
  const [groupMode, setGroupMode] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  // 進捗表示モードを2つに分ける
  const [pieProgressMode, setPieProgressMode] = useState<'all' | 'learned'>(
    'all',
  );
  const [chartProgressMode, setChartProgressMode] = useState<'all' | 'learned'>(
    'all',
  );
  const [scrolled, setScrolled] = useState(false);

  const { selectedDeck: deckData, isLoading } = useSelector(
    (state: RootState) => state.deck,
  );

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

  useEffect(() => {
    if (!deckId || Array.isArray(deckId)) return;
    dispatch(fetchDeckDetailsIfNeeded(deckId));
  }, [deckId, dispatch]);

  if (!deckId) {
    return (
      <div className="min-h-screen flex flex-col">
        <HeaderNav
          groupMode={groupMode}
          setGroupMode={setGroupMode}
          scrolled={scrolled}
        />
        <main className="flex-1 flex items-center justify-center">
          <div className="w-full text-center py-20 text-lg text-muted-foreground">
            データを取得中...
          </div>
        </main>
      </div>
    );
  }

  if (isLoading || !deckData) {
    return (
      <div className="min-h-screen flex flex-col">
        <HeaderNav
          groupMode={groupMode}
          setGroupMode={setGroupMode}
          scrolled={scrolled}
        />
        <main className="flex-1 flex items-center justify-center">
          <Loading />
        </main>
      </div>
    );
  }

  const totalCards = deckData.cards.length;
  const masteredCount = deckData.cards.filter(
    (card: { status: string }) => card.status === 'MASTERED',
  ).length;
  const strugglingCount = deckData.cards.filter(
    (card: { status: string }) => card.status === 'STRUGGLING',
  ).length;
  const unlearnedCount = deckData.cards.filter(
    (card: { status: string }) => card.status === 'UNLEARNED',
  ).length;
  const learnedCount = masteredCount + strugglingCount;

  // グラフデータの準備
  const chartData = deckData.progressHistory
    .map((history: StudyHistory) => ({
      ...history,
      date: getRelativeTime(history.createdAt),
      progress: history.progress,
    }))
    .reverse();

  // 円グラフ用の進捗計算
  const pieMasteredPercentage =
    totalCards > 0 ? Math.round((masteredCount / totalCards) * 100) : 0;
  const pieStrugglingPercentage =
    totalCards > 0 ? Math.round((strugglingCount / totalCards) * 100) : 0;
  const pieUnlearnedPercentage =
    totalCards > 0 ? Math.round((unlearnedCount / totalCards) * 100) : 0;

  const pieData = [
    {
      name: '覚えた',
      value: masteredCount,
      color: '#4ade80',
    },
    {
      name: '苦手',
      value: strugglingCount,
      color: '#f87171',
    },
    {
      name: '未学習',
      value: unlearnedCount,
      color: '#9ca3af',
    },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <HeaderNav
        groupMode={groupMode}
        setGroupMode={setGroupMode}
        scrolled={scrolled}
      />
      <main className="flex-1">
        <DashboardHeader
          heading={
            <span className="flex items-center">
              <MathRenderer text={deckData.title} />
              <Button
                variant="ghost"
                size="icon"
                className="ml-1 h-8 w-8"
                onClick={() => setEditOpen(true)}
              >
                <Edit2 className="h-4 w-4" />
              </Button>
            </span>
          }
          description={<MathRenderer text={deckData.description ?? ''} />}
        >
          <Link href="/dashboard">
            <Button variant="outline" className="h-10">
              <Home className="mr-2 h-4 w-4" />
              ダッシュボードへ
            </Button>
          </Link>
        </DashboardHeader>

        <div className="grid gap-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* 学習状況 */}
            <Card className="shadow-lg rounded-2xl border-0">
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle className="text-lg font-bold text-primary">
                    学習状況
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    <Button
                      variant={
                        pieProgressMode === 'all' ? 'default' : 'outline'
                      }
                      size="sm"
                      onClick={() => setPieProgressMode('all')}
                      className="h-7 text-xs"
                    >
                      全カード
                    </Button>
                    <Button
                      variant={
                        pieProgressMode === 'learned' ? 'default' : 'outline'
                      }
                      size="sm"
                      onClick={() => setPieProgressMode('learned')}
                      className="h-7 text-xs"
                    >
                      学習済み
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="flex flex-col items-center">
                <PieChart width={220} height={220}>
                  <Pie
                    data={pieData}
                    cx={110}
                    cy={110}
                    innerRadius={70}
                    outerRadius={100}
                    paddingAngle={2}
                    dataKey="value"
                    stroke="none"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
                <div className="mt-6 space-y-3 w-full">
                  <div className="flex items-center justify-between text-base">
                    <div className="flex items-center">
                      <span className="inline-block w-4 h-4 rounded-full bg-[#4ade80] mr-2" />
                      <span>覚えた</span>
                    </div>
                    <span className="font-bold text-[#4ade80]">
                      {pieMasteredPercentage}%
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-base">
                    <div className="flex items-center">
                      <span className="inline-block w-4 h-4 rounded-full bg-[#f87171] mr-2" />
                      <span>苦手</span>
                    </div>
                    <span className="font-bold text-[#f87171]">
                      {pieStrugglingPercentage}%
                    </span>
                  </div>
                  {pieProgressMode === 'all' && (
                    <div className="flex items-center justify-between text-base">
                      <div className="flex items-center">
                        <span className="inline-block w-4 h-4 rounded-full bg-[#9ca3af] mr-2" />
                        <span>未学習</span>
                      </div>
                      <span className="font-bold text-[#9ca3af]">
                        {pieUnlearnedPercentage}%
                      </span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* 学習の推移 */}
            <Card className="shadow-lg rounded-2xl border-0">
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle className="text-lg font-bold text-primary">
                    暗記レベルの推移（直近15回）
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <div className="w-full h-[320px]">
                  <ResponsiveContainer width="100%" height={320}>
                    <RechartsLineChart
                      data={chartData.slice(-15)}
                      margin={{ top: 20, right: 40, bottom: 20, left: 0 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis
                        dataKey="date"
                        tick={{ fontSize: 12 }}
                        interval="preserveStartEnd"
                      />
                      <YAxis
                        domain={[0, 100]}
                        tick={{ fontSize: 12 }}
                        tickFormatter={(value) => `${value}%`}
                      />
                      <Tooltip
                        formatter={(value: number) => [`${value}%`, '進捗率']}
                        labelFormatter={(label) => `学習日時: ${label}`}
                      />
                      <Line
                        type="monotone"
                        dataKey="progress"
                        stroke="#8b5cf6"
                        strokeWidth={3}
                        dot={{
                          r: 5,
                          stroke: '#8b5cf6',
                          strokeWidth: 2,
                          fill: '#fff',
                        }}
                        activeDot={{ r: 8 }}
                      />
                    </RechartsLineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* アクションボタン */}
          <div className="flex flex-col items-center sm:flex-row justify-center gap-6 mt-8">
            <Button
              variant="outline"
              size="lg"
              className="w-[90vw] max-w-sm text-base py-6 rounded-xl shadow"
              onClick={() => router.push(`/deck/${deckId}/cards`)}
            >
              <BookOpen className="mr-2 h-5 w-5" />
              カードリスト
            </Button>
            <Link href={`/study/${deckId}`} className="w-[90vw] max-w-sm">
              <Button
                size="lg"
                className="w-full text-base py-6 rounded-xl shadow bg-primary text-white hover:bg-primary/90"
              >
                <LineChart className="mr-2 h-5 w-5" />
                学習開始
              </Button>
            </Link>
          </div>
        </div>

        {/* ---------- デッキ編集モーダル ---------- */}
        <Dialog open={editOpen} onOpenChange={setEditOpen}>
          <DialogContent
            className="max-w-lg"
            aria-describedby="deck-edit-description"
          >
            <DialogHeader>
              <DialogTitle>デッキ設定</DialogTitle>
              <p
                id="deck-edit-description"
                className="text-sm text-muted-foreground"
              >
                デッキのタイトルと説明を編集できます。
              </p>
            </DialogHeader>

            <DeckEditForm
              deckId={deckId as string}
              initialTitle={deckData.title}
              initialDescription={deckData.description ?? ''}
              onSuccess={async () => {
                setEditOpen(false);
                // 更新後に再フェッチ
                dispatch(fetchDeckDetailsIfNeeded(deckId as string));
              }}
            />
          </DialogContent>
        </Dialog>
      </main>
    </div>
  );
}
