import { User, UserId, UserEmail } from '../../domain/entity/user';
import { IUserRepository } from '../../domain/repository/user';

export interface GetUserProfileRequest {
  userId?: UserId;
  email?: UserEmail;
}

export interface GetUserProfileResponse {
  success: boolean;
  user?: User;
  error?: string;
}

export class GetUserProfileUseCase {
  constructor(private userRepository: IUserRepository) {}

  async execute(
    request: GetUserProfileRequest,
  ): Promise<GetUserProfileResponse> {
    try {
      let user: User | null = null;

      if (request.userId) {
        user = await this.userRepository.findById(request.userId);
      } else if (request.email) {
        user = await this.userRepository.findByEmail(request.email);
      } else {
        return {
          success: false,
          error: 'ユーザーIDまたはメールアドレスが必要です',
        };
      }

      if (!user) {
        return {
          success: false,
          error: 'ユーザーが見つかりません',
        };
      }

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
            : 'ユーザープロフィールの取得に失敗しました',
      };
    }
  }
}
