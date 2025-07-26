'use client';

import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import type { RootState } from '@/src/lib/store/store';
import { ProfileHeader } from '@/src/components/profile/ProfileHeader';
import { UserInfo } from '@/src/components/profile/UserInfo';
import { UserPlan } from '@/src/components/profile/UserPlan';
import { Calendar } from '@/src/components/profile/Calendar';
import { HeaderNav } from '@/src/components/dashboard/header-nav';

export default function ProfilePage() {
  const user = useSelector((state: RootState) => state.user);
  const [currentMonth, setCurrentMonth] = useState(new Date());

  // HeaderNav用state
  const [groupMode, setGroupMode] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // スクロールイベント
  useEffect(() => {
    let ticking = false;
    const onScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          setScrolled(window.scrollY > 10);
          ticking = false;
        });
        ticking = true;
      }
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  if (!user || !user.email) return null;

  return (
    <div className="min-h-screen flex flex-col">
      <HeaderNav
        groupMode={groupMode}
        setGroupMode={setGroupMode}
        scrolled={scrolled}
      />
      <main className="flex-1 py-8">
        <div className="container mx-auto px-2 sm:px-4 py-4 sm:py-8 max-w-4xl">
          <ProfileHeader username={user.name || 'ユーザー名'} />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-8 mt-4 sm:mt-8">
            <div className="lg:col-span-1">
              <div className="flex flex-col gap-4 sm:gap-6">
                <UserInfo
                  username={user.name || 'ユーザー名'}
                  email={user.email}
                />
                <UserPlan />
              </div>
            </div>
            <div className="lg:col-span-2">
              <div className="bg-card rounded-xl shadow-sm p-3 sm:p-6 transition-all duration-300 hover:shadow-md border">
                <h2 className="text-lg sm:text-xl font-semibold text-foreground mb-2 sm:mb-4">
                  ログイン履歴
                </h2>
                <p className="text-muted-foreground mb-4 sm:mb-6 text-sm sm:text-base">
                  下記カレンダーであなたの学習継続状況を確認できます。
                </p>
                <Calendar
                  currentMonth={currentMonth}
                  setCurrentMonth={setCurrentMonth}
                />
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
