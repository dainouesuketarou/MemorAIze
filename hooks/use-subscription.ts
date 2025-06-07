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
  const { subscription, isLoading, lastFetched } = useSelector(
    (state: RootState) => state.user,
  );

  useEffect(() => {
    const fetchSubscription = async () => {
      // 最後の取得から5分以内の場合は再取得しない
      if (lastFetched && Date.now() - lastFetched < 5 * 60 * 1000) {
        return;
      }

      dispatch(setLoading(true));
      try {
        const response = await fetch('/api/subscription/status', {
          headers: {
            'Cache-Control': 'no-cache',
          },
        });

        if (!response.ok) {
          throw new Error('サブスクリプション情報の取得に失敗しました');
        }

        const data = await response.json();
        dispatch(setSubscription(data));
      } catch (error) {
        console.error('Error fetching subscription:', error);
        dispatch(setError('サブスクリプション情報の取得に失敗しました'));
        toast.error('サブスクリプション情報の取得に失敗しました');
      } finally {
        dispatch(setLoading(false));
      }
    };

    // 初回の取得
    fetchSubscription();

    // 定期的な更新（5分ごと）
    const interval = setInterval(fetchSubscription, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, [dispatch, lastFetched]);

  return { subscription, isLoading };
};
