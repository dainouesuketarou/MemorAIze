import { useEffect, useState, useRef } from 'react';
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

  // 重複実行を防ぐためのref
  const isFetching = useRef(false);

  useEffect(() => {
    const fetchAll = async () => {
      // ログインしていない場合は何もしない
      if (status !== 'authenticated' || !session?.user) {
        return;
      }

      // 既にフェッチ中の場合は何もしない
      if (isFetching.current) {
        console.log('既にデータ取得中、スキップ');
        return;
      }

      // すでに初期化済みで、ユーザーIDが存在する場合は何もしない
      if (initialized && userState.id) {
        console.log('初期化済みでユーザーIDが存在、スキップ');
        return;
      }

      // データ取得中は重複実行を防ぐ
      if (loading) {
        console.log('ローディング中、スキップ');
        return;
      }

      // Reduxにデータが既に存在する場合はAPIリクエストをスキップ
      const hasExistingData =
        userState.id && groups.length > 0 && decks.length > 0;
      if (hasExistingData) {
        console.log('Reduxにデータが存在するためAPIリクエストをスキップ');
        setInitialized(true);
        return;
      }

      isFetching.current = true;
      setLoading(true);

      try {
        console.log('ユーザーデータ一括取得開始');

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
        const [subRes, aiRes, deckRes, groupRes] = await Promise.allSettled([
          fetch('/api/subscription/status', {
            credentials: 'include',
            headers: {
              'Cache-Control': 'no-cache',
            },
          }),
          fetch('/api/ai-generation-limit', {
            credentials: 'include',
            headers: {
              'Cache-Control': 'no-cache',
            },
          }),
          fetch('/api/decks', {
            credentials: 'include',
            headers: {
              'Cache-Control': 'no-cache',
            },
          }),
          fetch('/api/groups', {
            credentials: 'include',
            headers: {
              'Cache-Control': 'no-cache',
            },
          }),
        ]);

        // 成功したレスポンスのみを処理
        const results = await Promise.allSettled([
          subRes.status === 'fulfilled'
            ? subRes.value.json()
            : Promise.resolve(null),
          aiRes.status === 'fulfilled'
            ? aiRes.value.json()
            : Promise.resolve(null),
          deckRes.status === 'fulfilled'
            ? deckRes.value.json()
            : Promise.resolve(null),
          groupRes.status === 'fulfilled'
            ? groupRes.value.json()
            : Promise.resolve(null),
        ]);

        const [subscription, aiLimitData, decksData, groupsData] = results.map(
          (result) => (result.status === 'fulfilled' ? result.value : null),
        );

        // Reduxに保存（nullの場合はスキップ）
        if (subscription) dispatch(setSubscription(subscription));
        if (aiLimitData?.limit) dispatch(setLimit(aiLimitData.limit));
        if (decksData) dispatch(setDecks(decksData));
        if (groupsData) dispatch(setGroups(groupsData));

        console.log('ユーザーデータ一括取得完了');
        setInitialized(true);
      } catch (e) {
        console.error('ユーザーデータ一括取得に失敗:', e);
        // エラーが発生しても初期化済みとしてマーク（無限ループを防ぐ）
        setInitialized(true);
      } finally {
        setLoading(false);
        isFetching.current = false;
      }
    };

    fetchAll();
  }, [
    status,
    session,
    userState.id,
    groups.length,
    decks.length,
    initialized,
    loading,
    dispatch,
  ]);

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
