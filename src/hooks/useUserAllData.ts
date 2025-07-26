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
      // ログインしていない場合は何もしない
      if (status !== 'authenticated' || !session?.user) {
        return;
      }

      // すでに初期化済みで、ユーザーIDが存在する場合は何もしない
      if (initialized && userState.id) {
        return;
      }

      // データ取得中は重複実行を防ぐ
      if (loading) {
        return;
      }

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

        // レスポンスのステータスをチェック
        if (!subRes.ok || !aiRes.ok || !deckRes.ok || !groupRes.ok) {
          throw new Error('APIリクエストが失敗しました');
        }

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
        console.error('ユーザーデータ一括取得に失敗:', e);
        // エラーが発生しても初期化済みとしてマーク（無限ループを防ぐ）
        setInitialized(true);
      } finally {
        setLoading(false);
      }
    };

    fetchAll();
  }, [status, session, userState.id, initialized, loading, dispatch]);

  // ログインしていない場合は初期状態を返す
  if (status === 'unauthenticated') {
    return {
      user: userState,
      subscription: null,
      groups: [],
      decks: [],
      aiLimit: null,
      loading: false,
    };
  }

  // ローディング中または認証中
  if (status === 'loading' || loading) {
    return {
      user: userState,
      subscription: userState.subscription,
      groups: groups || [],
      decks: decks || [],
      aiLimit: aiLimit || null,
      loading: true,
    };
  }

  return {
    user: userState,
    subscription: userState.subscription,
    groups: groups || [],
    decks: decks || [],
    aiLimit: aiLimit || null,
    loading: loading || userState.isLoading,
  };
};
