// components/dashboard/shell.tsx
'use client';

import { useEffect, useState } from 'react';
import { MainNav } from '@/components/dashboard/main-nav';
import { UserNav } from '@/components/dashboard/user-nav';
import { ThemeToggle } from '@/components/theme-toggle';
import { Bell, BadgeHelp as Help } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { Deck, Group } from '@prisma/client';
import { DeckWithCardsAndGroups } from '@/components/dashboard/deck-list';

interface DashboardShellProps {
  children: React.ReactNode;
  fullWidth?: boolean;
  groups: Group[];
  decks: DeckWithCardsAndGroups[];
  groupMode: boolean;
  setDecks: React.Dispatch<React.SetStateAction<DeckWithCardsAndGroups[]>>;
  setGroupMode: React.Dispatch<React.SetStateAction<boolean>>;
}

export function DashboardShell({
  children,
  fullWidth = false,
  groups,
  decks,
  setDecks,
  groupMode,
  setGroupMode,
}: DashboardShellProps) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      <header
        className={cn(
          "sticky top-0 z-40 w-full transition-all duration-200",
          scrolled ? "bg-background/95 backdrop-blur-sm border-b" : "bg-transparent"
        )}
      >
        <div className="max-w-7xl mx-auto flex h-16 items-center justify-between py-4 px-6 w-full">
          {/* ここだけに MainNav を描画 */}
          <MainNav groups={groups} decks={decks} setDecks={setDecks} groupMode={groupMode} setGroupMode={setGroupMode} />

          <div className="hidden flex-1 md:flex md:justify-center md:px-4">
            <div className="relative w-full max-w-md">
              <Input
                type="search"
                placeholder="暗記カード帳を検索"
                className="w-full bg-muted"
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Bell className="h-5 w-5 cursor-pointer text-muted-foreground hover:text-foreground transition-colors" />
            <Help className="h-5 w-5 cursor-pointer text-muted-foreground hover:text-foreground transition-colors" />
            <ThemeToggle />
            <UserNav />
          </div>
        </div>
      </header>

      <main
        className={cn(
          "flex-1 py-8",
          fullWidth ? "container-fluid" : ""
        )}
      >
        <div className="max-w-7xl mx-auto w-full px-8 space-y-3">
          {Array.isArray(children)
            ? children.map((child, i) => <div key={i}>{child}</div>)
            : <div>{children}</div>
          }
        </div>
      </main>
    </div>
  );
}
