'use client';

import { useSession } from 'next-auth/react';
import { useEffect, useRef } from 'react';
import { useDispatch } from 'react-redux';
import { setUser, clearUser } from '@/lib/store/slices/userSlice';
import { startOfDay, endOfDay } from 'date-fns';
import { toZonedTime } from 'date-fns-tz';
import { setDecks } from '@/lib/store/slices/deckSlice';
import { setGroups } from '@/lib/store/slices/groupSlice';
import { setLoginHistory } from '@/lib/store/slices/loginHistorySlice';
import { setLimit } from '@/lib/store/slices/aiGenerationLimitSlice';
import { setSubscription } from '@/lib/store/slices/userSlice';

export function SyncSessionToRedux({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session, status } = useSession();
  const dispatch = useDispatch();
  const previousUserId = useRef<string | null>(null);

  useEffect(() => {
    const updateUserState = async () => {
      if (status === 'authenticated' && session?.user) {
        const currentUserId = session.user.id as string;

        // ユーザーが変更された場合、Reduxの状態をクリア
        if (
          previousUserId.current &&
          previousUserId.current !== currentUserId
        ) {
          dispatch(setDecks([]));
          dispatch(setGroups([]));
          dispatch(setLoginHistory([]));
          dispatch(setLimit(null));
          dispatch(setSubscription(null));
        }

        // ユーザー情報をReduxに保存
        dispatch(
          setUser({
            id: currentUserId,
            email: session.user.email as string,
            name: session.user.name as string,
            image: session.user.image as string,
            isAuthenticated: true,
          }),
        );

        // その日のログイン記録を確認
        const today = toZonedTime(new Date(), 'Asia/Tokyo');
        const startOfToday = startOfDay(today);
        const endOfToday = endOfDay(today);

        try {
          // その日のログイン記録を取得
          const response = await fetch(
            `/api/auth/login-history?start=${startOfToday.toISOString()}&end=${endOfToday.toISOString()}`,
          );
          const data = await response.json();

          // その日のログイン記録がない場合のみ、新しい記録を作成
          if (!data.length) {
            await fetch('/api/auth/login-history', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                loginAt: today.toISOString(),
              }),
            });
          }
        } catch (error) {
          console.error('ログイン履歴の処理に失敗しました:', error);
        }

        // 現在のユーザーIDを保存
        previousUserId.current = currentUserId;
      } else if (status === 'unauthenticated') {
        dispatch(clearUser());
        dispatch(setDecks([]));
        dispatch(setGroups([]));
        dispatch(setLoginHistory([]));
        dispatch(setLimit(null));
        dispatch(setSubscription(null));
        previousUserId.current = null;
      }
    };

    updateUserState();
  }, [status, session, dispatch]);

  return <>{children}</>;
}
