import { z } from 'zod';
import { BaseResponse } from '../common/base.dto';

/**
 * デッキ設定取得レスポンスDTO
 */
export interface GetDeckSettingResponse
  extends BaseResponse<{
    id: string;
    userId: string;
    deckId: string;
    autoSpeak: boolean;
    reverse: boolean;
    shuffle: boolean;
    filterMode: string[];
    createdAt: string;
    updatedAt: string;
  } | null> {}

/**
 * デッキ設定更新リクエストDTO
 */
export const UpdateDeckSettingRequestSchema = z.object({
  autoSpeak: z.boolean().optional(),
  reverse: z.boolean().optional(),
  shuffle: z.boolean().optional(),
  filterMode: z
    .array(z.enum(['UNLEARNED', 'LEARNING', 'STRUGGLING', 'MASTERED']))
    .optional(),
  reset: z.boolean().optional(),
});

export type UpdateDeckSettingRequest = z.infer<
  typeof UpdateDeckSettingRequestSchema
>;

/**
 * デッキ設定更新レスポンスDTO
 */
export interface UpdateDeckSettingResponse
  extends BaseResponse<{
    id: string;
    userId: string;
    deckId: string;
    autoSpeak: boolean;
    reverse: boolean;
    shuffle: boolean;
    filterMode: string[];
    createdAt: string;
    updatedAt: string;
  }> {}
