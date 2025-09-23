import { GetDecksResponse, GetGroupsResponse } from '@/src/dto';

/**
 * DTOベースのデッキ型（フロントエンド用）
 */
export type DeckWithCardsAndGroups = NonNullable<GetDecksResponse['data']>[0];

/**
 * DTOベースのグループ型（フロントエンド用）
 */
export type GroupWithDetails = NonNullable<GetGroupsResponse['data']>[0];
