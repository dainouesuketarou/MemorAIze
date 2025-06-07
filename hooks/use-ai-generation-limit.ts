import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/lib/store/store';
import {
  setLimit,
  setLoading,
  setError,
} from '@/lib/store/slices/aiGenerationLimitSlice';
import { toast } from 'sonner';
import { useSession } from 'next-auth/react';

export function useAiGenerationLimit() {
  const dispatch = useDispatch();
  const { data: session } = useSession();
  const { limit, isLoading, error } = useSelector(
    (state: RootState) => state.aiGenerationLimit,
  );
  const { isAuthenticated } = useSelector((state: RootState) => state.user);

  useEffect(() => {
    const fetchLimit = async () => {
      if (!isAuthenticated || !session?.user?.id) {
        dispatch(setLoading(false));
        return;
      }

      if (!limit) {
        try {
          dispatch(setLoading(true));
          const response = await fetch('/api/ai-generation-limit', {
            credentials: 'include',
          });

          if (!response.ok) {
            if (response.status === 401) {
              throw new Error('認証が必要です。ログインしてください。');
            }
            throw new Error('AI生成制限の取得に失敗しました');
          }

          const data = await response.json();

          if (data.success) {
            dispatch(setLimit(data.limit));
          } else {
            throw new Error(data.error || 'AI生成制限の取得に失敗しました');
          }
        } catch (error) {
          console.error('Error fetching AI generation limit:', error);
          const errorMessage =
            error instanceof Error
              ? error.message
              : 'AI生成制限の取得に失敗しました';
          dispatch(setError(errorMessage));
          toast.error(errorMessage);
        } finally {
          dispatch(setLoading(false));
        }
      }
    };

    fetchLimit();
  }, [dispatch, isAuthenticated, session?.user?.id, limit]);

  return { limit, isLoading, error };
}
