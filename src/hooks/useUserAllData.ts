import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '@/src/lib/store/store';
import { setUser, setSubscription } from '@/src/lib/store/slices/userSlice';
import { setGroups } from '@/src/lib/store/slices/groupSlice';
import { setDecks } from '@/src/lib/store/slices/deckSlice';
import { setLimit } from '@/src/lib/store/slices/aiGenerationLimitSlice';
import { useSession } from 'next-auth/react';

/**
 * ユーザーがログインした時にUser, Subscription, AiGenerationLimit, Deck, Group情報を一括取得し、Reduxに保存するカスタムフック
 */
export const useUserAllData = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { data: session, status } = useSession();
  const userState = useSelector((state: RootState) => state.user);
  const groups = useSelector((state: RootState) => state.group.groups);
  const decks = useSelector((state: RootState) => state.deck.decks);
  const aiLimit = useSelector(
    (state: RootState) => state.aiGenerationLimit.limit,
  );
  const [loading, setLoading] = useState(false);
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    const fetchAll = async () => {
      if (
        status === 'authenticated' &&
        session?.user &&
        !userState.id &&
        !initialized
      ) {
        setLoading(true);
        try {
          // セッション情報をReduxに保存
          dispatch(
            setUser({
              id: session.user.id,
              email: session.user.email ?? null,
              name: session.user.name ?? null,
              image: session.user.image ?? null,
              isAuthenticated: true,
            }),
          );

          // 並列でAPI取得（セッションで取得できない情報のみ）
          const [subRes, aiRes, deckRes, groupRes] = await Promise.all([
            fetch('/api/subscription/status', { credentials: 'include' }),
            fetch('/api/ai-generation-limit', { credentials: 'include' }),
            fetch('/api/decks', { credentials: 'include' }),
            fetch('/api/groups', { credentials: 'include' }),
          ]);

          const [subscription, aiLimitData, decksData, groupsData] =
            await Promise.all([
              subRes.json(),
              aiRes.json(),
              deckRes.json(),
              groupRes.json(),
            ]);

          // Reduxに保存
          dispatch(setSubscription(subscription));
          dispatch(setLimit(aiLimitData.limit));
          dispatch(setDecks(decksData));
          dispatch(setGroups(groupsData));
          setInitialized(true);
        } catch (e) {
          // 必要に応じてエラーハンドリング
          console.error('ユーザーデータ一括取得に失敗:', e);
        } finally {
          setLoading(false);
        }
      }
    };
    fetchAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    status,
    session,
    userState.id,
    groups.length,
    decks.length,
    aiLimit,
    initialized,
  ]);

  return {
    user: userState,
    subscription: useSelector((state: RootState) => state.user.subscription),
    groups,
    decks,
    aiLimit,
    loading: loading || userState.isLoading,
  };
};
