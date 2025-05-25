'use client';

import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import type { RootState } from '@/lib/store/store';
import { ProfileHeader } from '@/components/profile/ProfileHeader';
import { UserInfo } from '@/components/profile/UserInfo';
import { UserPlan } from '@/components/profile/UserPlan';
import { Calendar } from '@/components/profile/Calendar';
import { cn } from '@/lib/utils';

export default function ProfilePage() {
  const user = useSelector((state: RootState) => state.user);
  const [loginHistory, setLoginHistory] = useState<Date[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentMonth, setCurrentMonth] = useState(new Date());

  useEffect(() => {
    const fetchLoginHistory = async () => {
      setLoading(true);
      const start = new Date(
        currentMonth.getFullYear(),
        currentMonth.getMonth(),
        1,
      );
      const end = new Date(
        currentMonth.getFullYear(),
        currentMonth.getMonth() + 1,
        0,
      );
      const res = await fetch(
        `/api/auth/login-history?start=${start.toISOString()}&end=${end.toISOString()}`,
      );
      const data = await res.json();
      setLoginHistory(
        data.map((item: { loginAt: string }) => new Date(item.loginAt)),
      );
      setLoading(false);
    };
    fetchLoginHistory();
  }, [currentMonth]);

  if (!user || !user.email) return null;

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
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
                loginDates={loginHistory}
                currentMonth={currentMonth}
                setCurrentMonth={setCurrentMonth}
                loading={loading}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
