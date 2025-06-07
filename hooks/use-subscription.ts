import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/lib/store/store';
import {
  setSubscription,
  setLoading,
  setError,
} from '@/lib/store/slices/userSlice';
import { toast } from 'sonner';

export const useSubscription = () => {
  const dispatch = useDispatch();
  const { subscription, isLoading, lastFetched, isAuthenticated } = useSelector(
    (state: RootState) => state.user,
  );

  useEffect(() => {
    const fetchSubscription = async () => {
      // 未認証の場合は早期リターン
      if (!isAuthenticated) {
        dispatch(setLoading(false));
        return;
      }

      // 最後の取得から5分以内の場合は再取得しない
      if (lastFetched && Date.now() - lastFetched < 5 * 60 * 1000) {
        return;
      }

      dispatch(setLoading(true));
      try {
        const response = await fetch('/api/subscription/status', {
          credentials: 'include',
          headers: {
            'Cache-Control': 'no-cache',
          },
        });

        if (!response.ok) {
          if (response.status === 401) {
            throw new Error('認証が必要です。ログインしてください。');
          }
          throw new Error('サブスクリプション情報の取得に失敗しました');
        }

        const data = await response.json();
        dispatch(setSubscription(data));
      } catch (error) {
        console.error('Error fetching subscription:', error);
        const errorMessage =
          error instanceof Error
            ? error.message
            : 'サブスクリプション情報の取得に失敗しました';
        dispatch(setError(errorMessage));
        toast.error(errorMessage);
      } finally {
        dispatch(setLoading(false));
      }
    };

    // 初回の取得
    fetchSubscription();

    // 定期的な更新（5分ごと）
    const interval = setInterval(fetchSubscription, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, [dispatch, lastFetched, isAuthenticated]);

  return { subscription, isLoading };
};
