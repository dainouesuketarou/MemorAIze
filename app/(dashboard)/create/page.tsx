'use client';

import { useState, useEffect } from 'react';
import { DashboardHeader } from '@/components/dashboard/header';
import { DashboardShell } from '@/components/dashboard/shell';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Brain, Hand, Home } from 'lucide-react';
import Link from 'next/link';
import { AiGenerateForm } from '@/components/cards/ai-generate-form';
import { ManualCreateForm } from '@/components/cards/manual-create-form';
import { Deck, Group } from '@prisma/client';
import { DeckWithCardsAndGroups } from '@/components/dashboard/deck-list';
import { useSession } from 'next-auth/react';

export default function CreatePage() {
  const { data: session } = useSession();
  const [groups, setGroups] = useState<Group[]>([]);
  const [decks, setDecks] = useState<DeckWithCardsAndGroups[]>([]);
  const [groupMode, setGroupMode] = useState(false);

  useEffect(() => {
    if (!session?.user?.id) return;

    fetch('/api/groups').then(res => res.json()).then(setGroups);
    fetch('/api/decks')
      .then(res => res.json())
      .then((data) => {
        const decksWithCards: DeckWithCardsAndGroups[] = data.map((deck: any) => ({
          ...deck,
          cards: deck.cards ?? [],
        }));
        setDecks(decksWithCards);
      });
  }, [session]);

  if (!session?.user?.id) {
    return (
      <DashboardShell
        groups={groups}
        decks={decks}
        setDecks={setDecks}
        groupMode={groupMode}
        setGroupMode={setGroupMode}
      >
        <div className="w-full text-center py-20 text-lg text-muted-foreground">
          ログインが必要です
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
      <DashboardHeader
        heading="新規作成"
        description="AIで生成または手動で暗記カード帳を作成します。"
      >
        <Link href="/dashboard">
          <Button variant="outline">
            <Home className="mr-2 h-4 w-4" />
            ダッシュボードへ
          </Button>
        </Link>
      </DashboardHeader>

      <Tabs defaultValue="ai" className="space-y-6">
        <TabsList>
          <TabsTrigger value="ai">
            <Brain className="mr-2 h-4 w-4" />
            AI生成
          </TabsTrigger>
          <TabsTrigger value="manual">
            <Hand className="mr-2 h-4 w-4" />
            手動作成
          </TabsTrigger>
        </TabsList>
        <TabsContent value="ai">
          <AiGenerateForm />
        </TabsContent>
        <TabsContent value="manual">
          <ManualCreateForm />
        </TabsContent>
      </Tabs>
    </DashboardShell>
  );
}