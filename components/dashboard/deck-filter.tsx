'use client';

import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface DeckFilterProps {
  filter: 'all' | 'inProgress' | 'completed' | 'notStarted';
  setFilter: (
    filter: 'all' | 'inProgress' | 'completed' | 'notStarted',
  ) => void;
  sort: 'recent' | 'alphabetical' | 'cardCount';
  setSort: (sort: 'recent' | 'alphabetical' | 'cardCount') => void;
}

export function DeckFilter({
  filter,
  setFilter,
  sort,
  setSort,
}: DeckFilterProps) {
  return (
    <div className="bg-card rounded-lg border p-4">
      <div className="flex items-center justify-between gap-6">
        <div className="overflow-x-auto">
          <Tabs
            defaultValue={filter}
            onValueChange={(v: string) => setFilter(v as any)}
          >
            <TabsList>
              <TabsTrigger value="all" className="whitespace-nowrap">
                全て
              </TabsTrigger>
              <TabsTrigger value="inProgress" className="whitespace-nowrap">
                学習中
              </TabsTrigger>
              <TabsTrigger value="completed" className="whitespace-nowrap">
                完了
              </TabsTrigger>
              <TabsTrigger value="notStarted" className="whitespace-nowrap">
                未開始
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
        <div className="flex-none">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="whitespace-nowrap">
                並び替え
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>並び替え</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => setSort('recent')}>
                最近の学習順
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSort('alphabetical')}>
                名前順
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSort('cardCount')}>
                カード数順
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  );
}
