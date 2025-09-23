import { z } from 'zod';
import { BaseResponse } from '../common/base.dto';

/**
 * カード追加リクエストDTO
 */
export const AddCardRequestSchema = z.object({
  deckId: z.string().min(1, 'デッキIDは必須です'),
  front: z.string().min(1, 'カードの表は必須です'),
  back: z.string().min(1, 'カードの裏は必須です'),
});

export type AddCardRequest = z.infer<typeof AddCardRequestSchema>;

/**
 * カード追加レスポンスDTO
 */
export interface AddCardResponse
  extends BaseResponse<{
    id: string;
    deckId: string;
    front: string;
    back: string;
    status: string;
    isFavorite: boolean;
    order: number;
    createdAt: string;
    updatedAt: string;
  }> {}

/**
 * カード更新リクエストDTO
 */
export const UpdateCardRequestSchema = z.object({
  front: z.string().min(1, 'カードの表は必須です').optional(),
  back: z.string().min(1, 'カードの裏は必須です').optional(),
  status: z
    .enum(['UNLEARNED', 'LEARNING', 'STRUGGLING', 'MASTERED'])
    .optional(),
  isFavorite: z.boolean().optional(),
  order: z.number().int().min(0).optional(),
});

export type UpdateCardRequest = z.infer<typeof UpdateCardRequestSchema>;

/**
 * カード更新レスポンスDTO
 */
export interface UpdateCardResponse
  extends BaseResponse<{
    id: string;
    deckId: string;
    front: string;
    back: string;
    status: string;
    isFavorite: boolean;
    order: number;
    createdAt: string;
    updatedAt: string;
  }> {}

/**
 * カード削除リクエストDTO
 */
export const DeleteCardRequestSchema = z.object({
  deckId: z.string().min(1, 'デッキIDは必須です'),
});

export type DeleteCardRequest = z.infer<typeof DeleteCardRequestSchema>;

/**
 * カード削除レスポンスDTO
 */
export interface DeleteCardResponse extends BaseResponse<null> {}

/**
 * カード一括保存リクエストDTO
 */
export const SaveCardsRequestSchema = z.object({
  deckId: z.string().min(1, 'デッキIDは必須です'),
  cards: z
    .array(
      z.object({
        front: z.string().min(1, 'カードの表は必須です'),
        back: z.string().min(1, 'カードの裏は必須です'),
      }),
    )
    .min(1, '少なくとも1つのカードが必要です'),
});

export type SaveCardsRequest = z.infer<typeof SaveCardsRequestSchema>;

/**
 * カード一括保存レスポンスDTO
 */
export interface SaveCardsResponse
  extends BaseResponse<
    Array<{
      id: string;
      deckId: string;
      front: string;
      back: string;
      status: string;
      isFavorite: boolean;
      order: number;
      createdAt: string;
      updatedAt: string;
    }>
  > {}
