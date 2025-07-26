'use client';

import { useSession } from 'next-auth/react';
import { useEffect } from 'react';
import { startOfDay, endOfDay } from 'date-fns';
import { toZonedTime } from 'date-fns-tz';

export function SyncSessionToRedux({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session, status } = useSession();

  useEffect(() => {
    const updateLoginHistory = async () => {
      if (status === 'authenticated' && session?.user) {
        // その日のログイン記録を確認
        const today = toZonedTime(new Date(), 'Asia/Tokyo');
        const startOfToday = startOfDay(today);
        const endOfToday = endOfDay(today);

        try {
          // その日のログイン記録を取得
          const response = await fetch(
            `/api/auth/login-history?start=${startOfToday.toISOString()}&end=${endOfToday.toISOString()}`,
          );

          if (response.ok) {
            const data = await response.json();
            const todayLogins = data.logins || [];

            // 今日のログイン記録がない場合のみ記録
            if (todayLogins.length === 0) {
              const now = new Date();
              const jpNow = new Date(now.getTime() + 9 * 60 * 60 * 1000);

              await fetch('/api/auth/login-history', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  loginAt: jpNow.toISOString(),
                }),
              });
            }
          }
        } catch (error) {
          console.error('ログイン履歴の記録に失敗:', error);
        }
      }
    };

    updateLoginHistory();
  }, [status, session]);

  return <>{children}</>;
}
