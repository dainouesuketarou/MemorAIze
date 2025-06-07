import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/lib/store/store';
import {
  setLimit,
  setLoading,
  setError,
} from '@/lib/store/slices/aiGenerationLimitSlice';
import { AiGenerationLimit } from '@/types/ai-generation-limit';

export function useAiGenerationLimit() {
  const dispatch = useDispatch();
  const { limit, isLoading, error } = useSelector(
    (state: RootState) => state.aiGenerationLimit,
  );

  useEffect(() => {
    const fetchLimit = async () => {
      try {
        dispatch(setLoading(true));
        const response = await fetch('/api/ai-generation-limit');
        const data = await response.json();

        if (data.success) {
          dispatch(setLimit(data.limit));
        } else {
          dispatch(setError(data.error || 'AI生成制限の取得に失敗しました'));
        }
      } catch (error) {
        console.error('Error fetching AI generation limit:', error);
        dispatch(setError('AI生成制限の取得に失敗しました'));
      } finally {
        dispatch(setLoading(false));
      }
    };

    fetchLimit();
  }, [dispatch]);

  return { limit, isLoading, error };
}
