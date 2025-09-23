import { z } from 'zod';
import { BaseResponse } from '../common/base.dto';

/**
 * グループ作成リクエストDTO
 */
export const CreateGroupRequestSchema = z.object({
  name: z
    .string()
    .min(1, 'グループ名は必須です')
    .max(50, 'グループ名は50文字以内で入力してください'),
  description: z
    .string()
    .max(200, '説明は200文字以内で入力してください')
    .optional(),
});

export type CreateGroupRequest = z.infer<typeof CreateGroupRequestSchema>;

/**
 * グループ作成レスポンスDTO
 */
export interface CreateGroupResponse
  extends BaseResponse<{
    id: string;
    name: string;
    description: string | null;
    userId: string;
    createdAt: string;
    updatedAt: string;
  }> {}

/**
 * グループ更新リクエストDTO
 */
export const UpdateGroupRequestSchema = z.object({
  name: z
    .string()
    .min(1, 'グループ名は必須です')
    .max(50, 'グループ名は50文字以内で入力してください')
    .optional(),
  description: z
    .string()
    .max(200, '説明は200文字以内で入力してください')
    .optional(),
  deckIds: z.array(z.string()).optional(),
});

export type UpdateGroupRequest = z.infer<typeof UpdateGroupRequestSchema>;

/**
 * グループ更新レスポンスDTO
 */
export interface UpdateGroupResponse
  extends BaseResponse<{
    id: string;
    name: string;
    description: string | null;
    userId: string;
    updatedAt: string;
  }> {}

/**
 * グループ一覧取得レスポンスDTO
 */
export interface GetGroupsResponse
  extends BaseResponse<
    Array<{
      id: string;
      name: string;
      description: string | null;
      userId: string;
      createdAt: string;
      updatedAt: string;
    }>
  > {}

/**
 * グループ削除レスポンスDTO
 */
export interface DeleteGroupResponse extends BaseResponse<null> {}
