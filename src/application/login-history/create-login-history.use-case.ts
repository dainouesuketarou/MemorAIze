import {
  LoginHistory,
  LoginHistoryId,
} from '../../domain/entity/login-history';
import { ILoginHistoryRepository } from '../../domain/repository/login-history';
import { UserId } from '../../domain/entity/user';

export interface CreateLoginHistoryRequest {
  userId: UserId;
  loginAt?: Date;
}

export interface CreateLoginHistoryResponse {
  success: boolean;
  loginHistory?: LoginHistory;
  error?: string;
}

export class CreateLoginHistoryUseCase {
  constructor(private loginHistoryRepository: ILoginHistoryRepository) {}

  async execute(
    request: CreateLoginHistoryRequest,
  ): Promise<CreateLoginHistoryResponse> {
    try {
      // 新しいログイン履歴IDを生成
      const loginHistoryId = await this.loginHistoryRepository.generateId();

      // ログイン履歴エンティティを作成
      const loginHistory = LoginHistory.create(
        request.userId,
        loginHistoryId,
        request.loginAt,
      );

      // ログイン履歴を保存
      await this.loginHistoryRepository.save(loginHistory);

      return {
        success: true,
        loginHistory,
      };
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : 'ログイン履歴の作成に失敗しました',
      };
    }
  }
}
