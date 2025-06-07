import { Deck, Group } from '@prisma/client';

/**
 * フロント／DeckList／DashboardShell 間で共通利用する型
 */
export type DeckWithCardsAndGroups = Omit<Deck, 'lastStudied'> & {
  lastStudied: string | null;
  /** カードのステータス一覧 */
  cards: { id: string; status: string }[];
  /** 紐づくグループ一覧 */
  groups: Group[];
  /** 学習履歴 */
  progressHistory: {
    progress: number;
    createdAt: string;
  }[];
};
