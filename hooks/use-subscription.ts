import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/lib/store/store';
import { setSubscription } from '@/lib/store/slices/userSlice';
import { toast } from 'sonner';

export const useSubscription = () => {
  const dispatch = useDispatch();
  const subscription = useSelector(
    (state: RootState) => state.user.subscription,
  );

  useEffect(() => {
    const fetchSubscription = async () => {
      try {
        const response = await fetch('/api/subscription/status');
        if (!response.ok) {
          throw new Error('サブスクリプション情報の取得に失敗しました');
        }
        const data = await response.json();
        dispatch(setSubscription(data));
      } catch (error) {
        console.error('Error fetching subscription:', error);
        toast.error('サブスクリプション情報の取得に失敗しました');
      }
    };

    // 初回の取得
    fetchSubscription();

    // 定期的な更新（5分ごと）
    const interval = setInterval(fetchSubscription, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, [dispatch]);

  return subscription;
};
