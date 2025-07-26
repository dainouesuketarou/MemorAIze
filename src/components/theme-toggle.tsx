'use client';

import * as React from 'react';
import { Moon, Sun, Palette } from 'lucide-react';
import { useTheme } from 'next-themes';

import { Button } from '@/src/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/src/components/ui/dropdown-menu';

export function ThemeToggle() {
  const { setTheme, theme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <Button variant="ghost" size="icon" className="h-9 w-9">
        <span className="sr-only">テーマを切り替え</span>
      </Button>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="h-9 w-9">
          {theme === 'light' && <Sun className="h-4 w-4" />}
          {theme === 'dark' && <Moon className="h-4 w-4" />}
          {theme === 'blue' && <Palette className="h-4 w-4 text-blue-400" />}
          {theme === 'green' && <Palette className="h-4 w-4 text-green-400" />}
          <span className="sr-only">テーマを切り替え</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => setTheme('light')}>
          ライト
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme('dark')}>
          ダーク
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme('blue')}>
          ブルー
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme('green')}>
          グリーン
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
