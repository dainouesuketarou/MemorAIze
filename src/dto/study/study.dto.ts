import { z } from 'zod';
import { BaseResponse, DateRangeQuerySchema } from '../common/base.dto';

/**
 * 学習履歴作成リクエストDTO
 */
export const CreateStudyHistoryRequestSchema = z.object({
  progress: z.number().min(0).max(100).optional(),
});

export type CreateStudyHistoryRequest = z.infer<
  typeof CreateStudyHistoryRequestSchema
>;

/**
 * 学習履歴作成レスポンスDTO
 */
export interface CreateStudyHistoryResponse
  extends BaseResponse<{
    id: string;
    deckId: string;
    progress: number;
    createdAt: string;
  }> {}

/**
 * 学習履歴取得クエリパラメータDTO
 */
export const GetStudyHistoryQuerySchema = DateRangeQuerySchema.extend({
  limit: z.coerce.number().min(1).max(100).default(50),
});

export type GetStudyHistoryQuery = z.infer<typeof GetStudyHistoryQuerySchema>;

/**
 * 学習履歴取得レスポンスDTO
 */
export interface GetStudyHistoryResponse
  extends BaseResponse<
    Array<{
      id: string;
      deckId: string;
      progress: number;
      createdAt: string;
    }>
  > {}

/**
 * 学習結果更新リクエストDTO
 */
export const UpdateStudyResultRequestSchema = z.object({
  results: z
    .array(
      z.object({
        id: z.string().min(1, 'カードIDは必須です'),
        mastered: z.boolean(),
      }),
    )
    .min(1, '少なくとも1つの結果が必要です'),
});

export type UpdateStudyResultRequest = z.infer<
  typeof UpdateStudyResultRequestSchema
>;

/**
 * 学習結果更新レスポンスDTO
 */
export interface UpdateStudyResultResponse extends BaseResponse<null> {}

/**
 * デッキ学習リクエストDTO
 */
export const StudyDeckRequestSchema = z.object({
  // デッキIDはパスパラメータから取得するため、リクエストボディは不要
});

export type StudyDeckRequest = z.infer<typeof StudyDeckRequestSchema>;

/**
 * デッキ学習レスポンスDTO
 */
export interface StudyDeckResponse
  extends BaseResponse<{
    deckId: string;
    cards: Array<{
      id: string;
      front: string;
      back: string;
      status: string;
      isFavorite: boolean;
      order: number;
    }>;
    settings: {
      autoSpeak: boolean;
      reverse: boolean;
      shuffle: boolean;
      filterMode: string[];
    };
  }> {}
