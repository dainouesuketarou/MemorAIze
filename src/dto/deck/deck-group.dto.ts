import { z } from 'zod';
import { BaseResponse } from '../common/base.dto';

/**
 * デッキをグループに追加するリクエストDTO
 */
export const AddDeckToGroupRequestSchema = z.object({
  groupName: z
    .string()
    .min(1, 'グループ名は必須です')
    .max(50, 'グループ名は50文字以内で入力してください'),
});

export type AddDeckToGroupRequest = z.infer<typeof AddDeckToGroupRequestSchema>;

/**
 * デッキをグループに追加するレスポンスDTO
 */
export interface AddDeckToGroupResponse
  extends BaseResponse<{
    groupId: string;
    deckId: string;
  }> {}

/**
 * デッキのグループ更新リクエストDTO
 */
export const UpdateDeckGroupsRequestSchema = z.object({
  groupIds: z.array(z.string()).min(0, 'グループIDは配列で指定してください'),
});

export type UpdateDeckGroupsRequest = z.infer<
  typeof UpdateDeckGroupsRequestSchema
>;

/**
 * デッキのグループ更新レスポンスDTO
 */
export interface UpdateDeckGroupsResponse
  extends BaseResponse<{
    deckId: string;
    groupIds: string[];
  }> {}
