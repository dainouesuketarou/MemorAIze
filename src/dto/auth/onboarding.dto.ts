import { z } from 'zod';
import { BaseResponse } from '../common/base.dto';

/**
 * オンボーディング状況取得リクエストDTO
 */
export interface GetOnboardingStatusRequest {
  // 認証情報はセッションから取得するため、リクエストボディは不要
}

/**
 * オンボーディング状況取得レスポンスDTO
 */
export interface GetOnboardingStatusResponse
  extends BaseResponse<{
    isOnboarded: boolean;
  }> {}

/**
 * オンボーディング完了リクエストDTO
 */
export const CompleteOnboardingRequestSchema = z.object({
  username: z
    .string()
    .min(1, 'ユーザー名は必須です')
    .max(50, 'ユーザー名は50文字以内で入力してください'),
  purposes: z
    .array(z.enum(['EXAM', 'LANGUAGE', 'PROFESSIONAL', 'PERSONAL']))
    .min(1, '学習目的を選択してください'),
});

export type CompleteOnboardingRequest = z.infer<
  typeof CompleteOnboardingRequestSchema
>;

/**
 * オンボーディング完了レスポンスDTO
 */
export interface CompleteOnboardingResponse
  extends BaseResponse<{
    id: string;
    username: string;
    email: string;
    isOnboarded: boolean;
    studyPurposes: string[];
  }> {}
