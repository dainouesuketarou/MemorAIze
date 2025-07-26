'use client';

import { Tabs, TabsList, TabsTrigger } from '@/src/components/ui/tabs';
import { Button } from '@/src/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/src/components/ui/dropdown-menu';
import { useDispatch } from 'react-redux';
import { setFilter, setSort } from '@/src/lib/store/slices/deckSlice';
import { AnyAction } from '@reduxjs/toolkit';
import { useCallback, useMemo } from 'react';

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
  const dispatch = useDispatch();

  const handleFilterChange = useCallback(
    (value: string) => {
      const newFilter = value as
        | 'all'
        | 'inProgress'
        | 'completed'
        | 'notStarted';
      dispatch(setFilter(newFilter) as unknown as AnyAction);
      setFilter(newFilter);
    },
    [dispatch, setFilter],
  );

  const handleSortChange = useCallback(
    (newSort: 'recent' | 'alphabetical' | 'cardCount') => {
      dispatch(setSort(newSort) as unknown as AnyAction);
      setSort(newSort);
    },
    [dispatch, setSort],
  );

  const sortOptions = useMemo(
    () => [
      { value: 'recent', label: '最近の学習順' },
      { value: 'alphabetical', label: '名前順' },
      { value: 'cardCount', label: 'カード数順' },
    ],
    [],
  );

  return (
    <div className="bg-card rounded-lg border p-4">
      <div className="flex items-center justify-between gap-6">
        <div className="overflow-x-auto">
          <Tabs value={filter} onValueChange={handleFilterChange}>
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
              {sortOptions.map((option) => (
                <DropdownMenuItem
                  key={option.value}
                  onClick={() => handleSortChange(option.value as any)}
                >
                  {option.label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  );
}
