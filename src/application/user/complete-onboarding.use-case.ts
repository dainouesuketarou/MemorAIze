import { User, UserId, UserEmail } from '../../domain/entity/user';
import { IUserRepository } from '../../domain/repository/user';
import { StudyPurposeType } from '../../domain/value-object/study-purpose';

export interface CompleteOnboardingRequest {
  userId: UserId;
  username: string;
  purposes: StudyPurposeType[];
}

export interface CompleteOnboardingResponse {
  success: boolean;
  user?: User;
  error?: string;
}

export class CompleteOnboardingUseCase {
  constructor(private userRepository: IUserRepository) {}

  async execute(
    request: CompleteOnboardingRequest,
  ): Promise<CompleteOnboardingResponse> {
    try {
      // ユーザーを取得
      const user = await this.userRepository.findById(request.userId);
      if (!user) {
        return {
          success: false,
          error: 'ユーザーが見つかりません',
        };
      }

      // オンボーディング完了処理
      user.completeOnboarding(request.username, request.purposes);

      // ユーザーを保存
      await this.userRepository.save(user);

      return {
        success: true,
        user,
      };
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : 'オンボーディングの保存に失敗しました',
      };
    }
  }
}
