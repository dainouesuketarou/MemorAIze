'use client';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { CreditCard, Settings, User, LogOut } from 'lucide-react';
import { signOut, useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useSelector } from 'react-redux';
import type { RootState } from '@/lib/store/store';
import { useState, useEffect } from 'react';
import { ShareModal } from '@/components/share/ShareModal';

export function UserNav() {
  const router = useRouter();
  const { status } = useSession();
  const user = useSelector((state: RootState) => state.user);
  const [shareOpen, setShareOpen] = useState(false);

  const handleSignOut = async () => {
    try {
      await signOut({
        redirect: false,
        callbackUrl: '/login',
      });
      router.push('/login');
    } catch (error) {
      console.error('ログアウトに失敗しました:', error);
    }
  };

  // ローディング中は何も表示しない
  if (status === 'loading') {
    return null;
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Avatar className="h-8 w-8 cursor-pointer">
            <AvatarImage
              src={user?.image || 'https://github.com/shadcn.png'}
              alt={user?.name || '@user'}
            />
            <AvatarFallback>
              {user?.name?.[0]?.toUpperCase() || 'ME'}
            </AvatarFallback>
          </Avatar>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56" align="end" forceMount>
          <DropdownMenuLabel className="font-normal">
            <div className="flex flex-col space-y-1">
              <p className="text-sm font-medium leading-none">
                {user?.name || 'ユーザー名'}
              </p>
              <p className="text-xs leading-none text-muted-foreground">
                {user?.email || 'user@example.com'}
              </p>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuGroup>
            <DropdownMenuItem onClick={() => router.push('/profile')}>
              <User className="mr-2 h-4 w-4" />
              <span>プロフィール</span>
            </DropdownMenuItem>
            <DropdownMenuItem>
              <CreditCard className="mr-2 h-4 w-4" />
              <span>課金情報</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setShareOpen(true)}>
              <Settings className="mr-2 h-4 w-4" />
              <span>共有</span>
            </DropdownMenuItem>
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleSignOut}>
            <LogOut className="mr-2 h-4 w-4" />
            <span>ログアウト</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <ShareModal
        open={shareOpen}
        onClose={() => {
          window.dispatchEvent(new Event('refreshDecks'));
          setShareOpen(false);
        }}
      />
    </>
  );
}
