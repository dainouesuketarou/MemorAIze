import {
  AiGenerationLimit,
  AiGenerationLimitId,
} from '../../domain/entity/ai-generation-limit';
import { IAiGenerationLimitRepository } from '../../domain/repository/ai-generation-limit';
import { UserId } from '../../domain/entity/user';

export interface IncrementAiLimitRequest {
  userId: UserId;
  month?: Date;
}

export interface IncrementAiLimitResponse {
  success: boolean;
  aiGenerationLimit?: AiGenerationLimit;
  error?: string;
}

export class IncrementAiLimitUseCase {
  constructor(
    private aiGenerationLimitRepository: IAiGenerationLimitRepository,
  ) {}

  async execute(
    request: IncrementAiLimitRequest,
  ): Promise<IncrementAiLimitResponse> {
    try {
      const targetMonth = request.month || new Date();

      // 既存のAI生成制限を取得
      let aiGenerationLimit =
        await this.aiGenerationLimitRepository.findByUserIdAndMonth(
          request.userId,
          targetMonth,
        );

      if (!aiGenerationLimit) {
        // 新しいAI生成制限を作成
        const aiGenerationLimitId =
          await this.aiGenerationLimitRepository.generateId();
        aiGenerationLimit = AiGenerationLimit.create(
          request.userId,
          targetMonth,
          aiGenerationLimitId,
        );
      }

      // カウントをインクリメント
      aiGenerationLimit.increment();

      // AI生成制限を保存
      await this.aiGenerationLimitRepository.save(aiGenerationLimit);

      return {
        success: true,
        aiGenerationLimit,
      };
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : 'AI生成制限のインクリメントに失敗しました',
      };
    }
  }
}
