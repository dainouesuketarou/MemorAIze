import { Deck, Group } from '@prisma/client';

/**
 * フロント／DeckList／DashboardShell 間で共通利用する型
 */
export type DeckWithCardsAndGroups = Deck & {
  /** カードのステータス一覧 */
  cards: { id: string; status: string }[];
  /** 紐づくグループ一覧 */
  groups: Group[];
};