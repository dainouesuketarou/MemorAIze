'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { BrainCircuit, FileText, Group as GroupIcon, Repeat } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Group } from '@prisma/client';
import { DeckWithCardsAndGroups } from '@/components/dashboard/deck-list';

interface MainNavProps {
  groups: Group[];
  decks: DeckWithCardsAndGroups[];
  setDecks: React.Dispatch<React.SetStateAction<DeckWithCardsAndGroups[]>>;
  groupMode: boolean;
  setGroupMode: React.Dispatch<React.SetStateAction<boolean>>;
}

export function MainNav({
  groups = [],        // デフォルトは空配列
  decks = [],         // デフォルトは空配列
  setDecks = () => {},// デフォルトは no-op
  groupMode = false,
  setGroupMode = () => {},
}: MainNavProps) {
  const pathname = usePathname();

  return (
    <div className="flex items-center">
      <Link href="/dashboard" className="mr-6 flex items-center space-x-2">
        <BrainCircuit className="h-6 w-6" />
        <span className="hidden font-bold sm:inline-block">
          MemorAIze
        </span>
      </Link>
      <nav className="flex items-center space-x-2">
        <Link href="/dashboard">
          <Button
            variant="ghost"
            className={cn(
              "text-sm font-medium transition-colors py-2",
              pathname === "/dashboard" ? "text-foreground" : "text-muted-foreground"
            )}
          >
            <FileText className="mr-2 h-4 w-4" />
            暗記カード帳
          </Button>
        </Link>
        <Button
          variant={groupMode ? 'default' : 'ghost'}
          className={cn(
            "text-sm font-medium transition-colors",
            groupMode ? "text-foreground" : "text-muted-foreground"
          )}
          onClick={() => setGroupMode(!groupMode)}
        >
          <GroupIcon className="mr-2 h-4 w-4" />
          {groupMode ? 'グループ化モード解除' : 'グループ化'}
        </Button>
        {/* <Link href="/dashboard/review">
          <Button
            variant="ghost"
            className={cn(
              "text-sm font-medium transition-colors",
              pathname === "/dashboard/review" ? "text-foreground" : "text-muted-foreground"
            )}
          >
            <Repeat className="mr-2 h-4 w-4" />
            復習計画
          </Button>
        </Link> */}
      </nav>
    </div>
  );
}
