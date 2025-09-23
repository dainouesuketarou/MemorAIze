import { AiGenerationLimit } from '../../domain/entity/ai-generation-limit';
import { IAiGenerationLimitRepository } from '../../domain/repository/ai-generation-limit';
import { UserId } from '../../domain/entity/user';

export interface GetUserAiLimitRequest {
  userId: UserId;
  month?: Date;
}

export interface GetUserAiLimitResponse {
  success: boolean;
  aiGenerationLimit?: AiGenerationLimit;
  error?: string;
}

export class GetUserAiLimitUseCase {
  constructor(
    private aiGenerationLimitRepository: IAiGenerationLimitRepository,
  ) {}

  async execute(
    request: GetUserAiLimitRequest,
  ): Promise<GetUserAiLimitResponse> {
    try {
      const targetMonth = request.month || new Date();

      const aiGenerationLimit =
        await this.aiGenerationLimitRepository.findByUserIdAndMonth(
          request.userId,
          targetMonth,
        );

      return {
        success: true,
        aiGenerationLimit: aiGenerationLimit || undefined,
      };
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : 'AI生成制限の取得に失敗しました',
      };
    }
  }
}
