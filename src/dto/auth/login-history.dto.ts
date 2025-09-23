import { z } from 'zod';
import { BaseResponse, DateRangeQuerySchema } from '../common/base.dto';

/**
 * ログイン履歴作成リクエストDTO
 */
export const CreateLoginHistoryRequestSchema = z.object({
  loginAt: z.string().datetime().optional(),
});

export type CreateLoginHistoryRequest = z.infer<
  typeof CreateLoginHistoryRequestSchema
>;

/**
 * ログイン履歴作成レスポンスDTO
 */
export interface CreateLoginHistoryResponse
  extends BaseResponse<{
    id: string;
    userId: string;
    loginAt: string;
    createdAt: string;
  }> {}

/**
 * ログイン履歴取得クエリパラメータDTO
 */
export const GetLoginHistoryQuerySchema = DateRangeQuerySchema.extend({
  limit: z.coerce.number().min(1).max(100).default(50),
});

export type GetLoginHistoryQuery = z.infer<typeof GetLoginHistoryQuerySchema>;

/**
 * ログイン履歴取得レスポンスDTO
 */
export interface GetLoginHistoryResponse
  extends BaseResponse<
    Array<{
      id: string;
      userId: string;
      loginAt: string;
      createdAt: string;
    }>
  > {}
