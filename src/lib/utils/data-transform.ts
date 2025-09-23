/**
 * APIレスポンスから取得したデータを、フロントエンドコンポーネントが期待する形式に変換するユーティリティ
 */

/**
 * デッキデータのプロパティ名を変換（_id → id, _title → title など）
 */
export const transformDeckData = (deck: any) => ({
  id: deck._id || deck.id,
  userId: deck._userId || deck.userId,
  title: deck._title || deck.title,
  description: deck._description || deck.description,
  cardCount: deck.cardCount || (deck._cards ? deck._cards.length : 0),
  progress: deck.progress || 0,
  lastStudied: deck.lastStudied,
  shareCode: deck.shareCode,
  createdAt: deck.createdAt,
  updatedAt: deck.updatedAt,
  cards: deck._cards
    ? deck._cards.map((card: any) => ({
        id: card._id || card.id,
        status: card.status,
      }))
    : deck.cards || [],
  groups: deck._groups
    ? deck._groups.map((group: any) => ({
        id: group._id || group.id,
        name: group._name || group.name,
        description: group._description || group.description,
      }))
    : deck.groups || [],
  progressHistory: deck.progressHistory || [],
});

/**
 * グループデータのプロパティ名を変換（_id → id, _name → name など）
 */
export const transformGroupData = (group: any) => ({
  id: group._id || group.id,
  userId: group._userId || group.userId,
  name: group._name || group.name,
  description: group._description || group.description,
  deckIds: group._deckIds || group.deckIds || [],
  createdAt: group.createdAt,
  updatedAt: group.updatedAt,
});

/**
 * デッキ配列の変換
 */
export const transformDecksData = (decks: any[]) => {
  return (decks || []).map(transformDeckData);
};

/**
 * グループ配列の変換
 */
export const transformGroupsData = (groups: any[]) => {
  return (groups || []).map(transformGroupData);
};
