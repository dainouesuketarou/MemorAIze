import { UserId } from '../../domain/entity/user';
import { IUserRepository } from '../../domain/repository/user';

export interface GetOnboardingStatusRequest {
  userId: UserId;
}

export interface GetOnboardingStatusResponse {
  success: boolean;
  isOnboarded?: boolean;
  error?: string;
}

export class GetOnboardingStatusUseCase {
  constructor(private userRepository: IUserRepository) {}

  async execute(
    request: GetOnboardingStatusRequest,
  ): Promise<GetOnboardingStatusResponse> {
    try {
      const user = await this.userRepository.findById(request.userId);

      if (!user) {
        return {
          success: false,
          error: 'ユーザーが見つかりません',
        };
      }

      return {
        success: true,
        isOnboarded: user.isOnboarded,
      };
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : 'オンボーディング状況の取得に失敗しました',
      };
    }
  }
}
