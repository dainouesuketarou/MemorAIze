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

export default function CreatePage() {
  const [groups, setGroups] = useState<Group[]>([]);
  const [decks, setDecks] = useState<(Deck & { groups: Group[] })[]>([]);
  const [groupMode, setGroupMode] = useState(false);

  useEffect(() => {
    fetch('/api/groups').then(res => res.json()).then(setGroups);
    fetch('/api/decks').then(res => res.json()).then(setDecks);
  }, []);

  return (
    <DashboardShell
      groups={groups}
      decks={decks}
      setDecks={setDecks}
      groupMode={groupMode}
      setGroupMode={setGroupMode}
    >
      <DashboardHeader
        heading="カード作成"
        description="AI生成または手動で暗記カードを作成します。"
      />
      
      <Tabs defaultValue="ai" className="w-full">
        <TabsList className="grid grid-cols-2 w-full max-w-md mb-6">
          <TabsTrigger value="ai">AIで生成</TabsTrigger>
          <TabsTrigger value="manual">手動で作成</TabsTrigger>
        </TabsList>
        
        <TabsContent value="ai">
          <div className="grid gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-xl">AIでカードを自動生成</CardTitle>
                <CardDescription>
                  テキスト、PDF、または画像から暗記カードを生成します
                </CardDescription>
              </CardHeader>
              <CardContent>
                <AiGenerateForm />
              </CardContent>
              <CardFooter className="flex justify-between border-t pt-6">
                <Link href="/dashboard">
                  <Button variant="outline">
                    <Home className="mr-2 h-4 w-4" />
                    ホームに戻る
                  </Button>
                </Link>
              </CardFooter>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="manual">
          <div className="grid gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-xl">カードを手動作成</CardTitle>
                <CardDescription>
                  暗記カードを自分で作成します
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ManualCreateForm />
              </CardContent>
              <CardFooter className="flex justify-between border-t pt-6">
                <Link href="/dashboard">
                  <Button variant="outline">
                    <Home className="mr-2 h-4 w-4" />
                    ホームに戻る
                  </Button>
                </Link>
              </CardFooter>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </DashboardShell>
  );
}