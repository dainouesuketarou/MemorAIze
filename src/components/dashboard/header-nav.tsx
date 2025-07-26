'use client';

import { MainNav } from '@/src/components/dashboard/main-nav';
import { UserNav } from '@/src/components/dashboard/user-nav';
import { ThemeToggle } from '@/src/components/theme-toggle';
import { cn } from '@/src/lib/utils';

interface HeaderNavProps {
  groupMode: boolean;
  setGroupMode: React.Dispatch<React.SetStateAction<boolean>>;
  scrolled?: boolean;
}

export function HeaderNav({
  groupMode,
  setGroupMode,
  scrolled = false,
}: HeaderNavProps) {
  return (
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

        <div className="flex items-center gap-2">
          <ThemeToggle />
          <UserNav />
        </div>
      </div>
    </header>
  );
}
