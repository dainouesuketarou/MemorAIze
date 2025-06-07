// app/dashboard/page.tsx
'use client';

import { useState } from 'react';
import { DashboardHeader } from '@/components/dashboard/header';
import { DashboardShell } from '@/components/dashboard/shell';
import { DeckList } from '@/components/dashboard/deck-list';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { Sidebar } from '@/components/dashboard/sidebar';
import { DeckFilter } from '@/components/dashboard/deck-filter';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '@/lib/store/store';
import { setFilter, setSort } from '@/lib/store/slices/deckSlice';
import { AnyAction } from '@reduxjs/toolkit';

export default function DashboardPage() {
  const { data: session } = useSession();
  const dispatch = useDispatch<AppDispatch>();
  const { filter: reduxFilter, sort: reduxSort } = useSelector(
    (state: RootState) => state.deck,
  );
  const [groupMode, setGroupMode] = useState<boolean>(false);

  return (
    <DashboardShell groupMode={groupMode} setGroupMode={setGroupMode}>
      <div className="space-y-6">
        <DashboardHeader
          heading="マイデッキ"
          description="あなたの暗記カード帳一覧です。"
        >
          <Link href="/create">
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" />
              新規作成
            </Button>
          </Link>
        </DashboardHeader>

        <DeckFilter
          filter={reduxFilter}
          setFilter={(filter) =>
            dispatch(setFilter(filter) as unknown as AnyAction)
          }
          sort={reduxSort}
          setSort={(sort) => dispatch(setSort(sort) as unknown as AnyAction)}
        />

        <div className="py-4 pl-4 pr-8 flex lg:flex-row gap-5">
          <div className="w-4/5 lg:w-10/12">
            <DeckList groupMode={groupMode} />
          </div>
          <div className="w-1/5 lg:w-2/12">
            <Sidebar />
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}
