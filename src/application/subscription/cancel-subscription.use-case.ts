import { Subscription } from '../../domain/entity/subscription';
import { ISubscriptionRepository } from '../../domain/repository/subscription';
import { UserId } from '../../domain/entity/user';

export interface CancelSubscriptionRequest {
  userId: UserId;
  cancelAtPeriodEnd?: boolean;
}

export interface CancelSubscriptionResponse {
  success: boolean;
  subscription?: Subscription;
  error?: string;
}

export class CancelSubscriptionUseCase {
  constructor(private subscriptionRepository: ISubscriptionRepository) {}

  async execute(
    request: CancelSubscriptionRequest,
  ): Promise<CancelSubscriptionResponse> {
    try {
      // サブスクリプションを取得
      const subscription = await this.subscriptionRepository.findByUserId(
        request.userId,
      );

      if (!subscription) {
        return {
          success: false,
          error: 'サブスクリプションが見つかりません',
        };
      }

      // サブスクリプションをキャンセル
      subscription.cancel(request.cancelAtPeriodEnd || false);

      // サブスクリプションを保存
      await this.subscriptionRepository.save(subscription);

      return {
        success: true,
        subscription,
      };
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : 'サブスクリプションのキャンセルに失敗しました',
      };
    }
  }
}
