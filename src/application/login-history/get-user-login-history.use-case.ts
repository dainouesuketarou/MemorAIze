import { LoginHistory } from '../../domain/entity/login-history';
import { ILoginHistoryRepository } from '../../domain/repository/login-history';
import { UserId } from '../../domain/entity/user';

export interface GetUserLoginHistoryRequest {
  userId: UserId;
  startDate?: Date;
  endDate?: Date;
  limit?: number;
}

export interface GetUserLoginHistoryResponse {
  success: boolean;
  loginHistories?: LoginHistory[];
  error?: string;
}

export class GetUserLoginHistoryUseCase {
  constructor(private loginHistoryRepository: ILoginHistoryRepository) {}

  async execute(
    request: GetUserLoginHistoryRequest,
  ): Promise<GetUserLoginHistoryResponse> {
    try {
      let loginHistories: LoginHistory[];

      if (request.limit) {
        // 最新のログイン履歴を指定件数取得
        loginHistories =
          await this.loginHistoryRepository.findLatestByUserIdWithLimit(
            request.userId,
            request.limit,
          );
      } else if (request.startDate && request.endDate) {
        // 日付範囲でログイン履歴を取得
        loginHistories =
          await this.loginHistoryRepository.findByUserIdAndDateRange(
            request.userId,
            request.startDate,
            request.endDate,
          );
      } else {
        // ユーザーの全ログイン履歴を取得
        loginHistories = await this.loginHistoryRepository.findByUserId(
          request.userId,
        );
      }

      return {
        success: true,
        loginHistories,
      };
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : 'ログイン履歴の取得に失敗しました',
      };
    }
  }
}
