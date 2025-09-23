import { Subscription, SubscriptionId } from '../../domain/entity/subscription';
import { ISubscriptionRepository } from '../../domain/repository/subscription';
import { UserId } from '../../domain/entity/user';
import { SubscriptionPlanType } from '../../domain/value-object/subscription-plan';

export interface ActivateSubscriptionRequest {
  userId: UserId;
  stripeSubscriptionId: string;
  stripePriceId: string;
  currentPeriodEnd: Date;
  plan: SubscriptionPlanType;
}

export interface ActivateSubscriptionResponse {
  success: boolean;
  subscription?: Subscription;
  error?: string;
}

export class ActivateSubscriptionUseCase {
  constructor(private subscriptionRepository: ISubscriptionRepository) {}

  async execute(
    request: ActivateSubscriptionRequest,
  ): Promise<ActivateSubscriptionResponse> {
    try {
      // 既存のサブスクリプションを取得
      let subscription = await this.subscriptionRepository.findByUserId(
        request.userId,
      );

      if (!subscription) {
        // 新しいサブスクリプションを作成
        const subscriptionId = await this.subscriptionRepository.generateId();
        subscription = Subscription.createFree(request.userId, subscriptionId);
      }

      // サブスクリプションをアクティブ化
      subscription.activate(
        request.stripeSubscriptionId,
        request.stripePriceId,
        request.currentPeriodEnd,
        request.plan,
      );

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
            : 'サブスクリプションのアクティベーションに失敗しました',
      };
    }
  }
}
