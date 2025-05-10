'use client';
import { useSession } from 'next-auth/react';
import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { setUser } from '@/store/userSlice';

export function SyncSessionToRedux({ children }: { children: React.ReactNode }) {
  const { data: session } = useSession();
  const dispatch = useDispatch();

  useEffect(() => {
    if (session && session.user && session.user.email) {
      // 必要な情報をUserState型に変換
      const user = {
        email: session.user.email,
        name: session.user.name || undefined,
        image: session.user.image || undefined,
      };
      dispatch(setUser(user));
    } else {
      dispatch(setUser(null));
    }
  }, [session, dispatch]);

  return <>{children}</>;
}