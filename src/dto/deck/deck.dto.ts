import { z } from 'zod';
import {
  BaseResponse,
  PaginationQuerySchema,
  SortQuerySchema,
} from '../common/base.dto';

/**
 * デッキ作成リクエストDTO
 */
export const CreateDeckRequestSchema = z.object({
  title: z
    .string()
    .min(1, 'タイトルは必須です')
    .max(100, 'タイトルは100文字以内で入力してください'),
  description: z
    .string()
    .max(500, '説明は500文字以内で入力してください')
    .optional(),
  cards: z
    .array(
      z.object({
        front: z.string().min(1, 'カードの表は必須です'),
        back: z.string().min(1, 'カードの裏は必須です'),
      }),
    )
    .min(1, '少なくとも1つのカードが必要です'),
  groupIds: z.array(z.string()).optional(),
});

export type CreateDeckRequest = z.infer<typeof CreateDeckRequestSchema>;

/**
 * デッキ作成レスポンスDTO
 */
export interface CreateDeckResponse
  extends BaseResponse<{
    id: string;
    title: string;
    description: string | null;
    userId: string;
    cardCount: number;
    progress: number;
    lastStudied: string | null;
    shareCode: string;
    createdAt: string;
    updatedAt: string;
  }> {}

/**
 * デッキ更新リクエストDTO
 */
export const UpdateDeckRequestSchema = z.object({
  title: z
    .string()
    .min(1, 'タイトルは必須です')
    .max(100, 'タイトルは100文字以内で入力してください')
    .optional(),
  description: z
    .string()
    .max(500, '説明は500文字以内で入力してください')
    .optional(),
  groupIds: z.array(z.string()).optional(),
});

export type UpdateDeckRequest = z.infer<typeof UpdateDeckRequestSchema>;

/**
 * デッキ更新レスポンスDTO
 */
export interface UpdateDeckResponse
  extends BaseResponse<{
    id: string;
    title: string;
    description: string | null;
    userId: string;
    cardCount: number;
    progress: number;
    lastStudied: string | null;
    shareCode: string;
    updatedAt: string;
  }> {}

/**
 * デッキ取得レスポンスDTO
 */
export interface GetDeckResponse
  extends BaseResponse<{
    id: string;
    title: string;
    description: string | null;
    userId: string;
    cardCount: number;
    progress: number;
    lastStudied: string | null;
    shareCode: string;
    createdAt: string;
    updatedAt: string;
    cards: Array<{
      id: string;
      front: string;
      back: string;
      status: string;
      isFavorite: boolean;
      order: number;
      createdAt: string;
      updatedAt: string;
    }>;
    stats: {
      mastered: number;
      struggling: number;
      unlearned: number;
    };
  }> {}

/**
 * デッキ削除レスポンスDTO
 */
export interface DeleteDeckResponse extends BaseResponse<null> {}

/**
 * デッキ一覧取得クエリパラメータDTO
 */
export const GetDecksQuerySchema = PaginationQuerySchema.extend({
  ...SortQuerySchema.shape,
  search: z.string().optional(),
  groupId: z.string().optional(),
});

export type GetDecksQuery = z.infer<typeof GetDecksQuerySchema>;

/**
 * デッキ一覧取得レスポンスDTO（カードとグループ情報を含む）
 */
export interface GetDecksResponse
  extends BaseResponse<
    Array<{
      id: string;
      title: string;
      description: string | null;
      userId: string;
      cardCount: number;
      progress: number;
      lastStudied: string | null;
      shareCode: string;
      createdAt: string;
      updatedAt: string;
      cards: Array<{
        id: string;
        status: string;
      }>;
      groups: Array<{
        id: string;
        name: string;
        description: string | null;
      }>;
      progressHistory: Array<{
        progress: number;
        createdAt: string;
      }>;
    }>
  > {}
