import { Subscription } from '../../domain/entity/subscription';
import { ISubscriptionRepository } from '../../domain/repository/subscription';
import { UserId } from '../../domain/entity/user';

export interface GetUserSubscriptionRequest {
  userId: UserId;
}

export interface GetUserSubscriptionResponse {
  success: boolean;
  subscription?: Subscription;
  error?: string;
}

export class GetUserSubscriptionUseCase {
  constructor(private subscriptionRepository: ISubscriptionRepository) {}

  async execute(
    request: GetUserSubscriptionRequest,
  ): Promise<GetUserSubscriptionResponse> {
    try {
      const subscription = await this.subscriptionRepository.findByUserId(
        request.userId,
      );

      return {
        success: true,
        subscription: subscription || undefined,
      };
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : 'サブスクリプションの取得に失敗しました',
      };
    }
  }
}
