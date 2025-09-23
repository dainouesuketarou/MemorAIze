import { Subscription, SubscriptionId } from '../entity/subscription';
import { UserId } from '../entity/user';

export interface ISubscriptionRepository {
  /**
   * 新しいIDを生成する
   */
  generateId(): Promise<SubscriptionId>;

  /**
   * IDでSubscriptionを検索する
   * @param id サブスクリプションのID
   */
  findById(id: SubscriptionId): Promise<Subscription | null>;

  /**
   * ユーザーIDでSubscriptionを検索する
   * @param userId ユーザーのID
   */
  findByUserId(userId: UserId): Promise<Subscription | null>;

  /**
   * StripeサブスクリプションIDでSubscriptionを検索する
   * @param stripeSubscriptionId StripeサブスクリプションID
   */
  findByStripeSubscriptionId(
    stripeSubscriptionId: string,
  ): Promise<Subscription | null>;

  /**
   * Subscriptionを保存（新規作成または更新）する
   * @param subscription 保存するSubscriptionエンティティ
   */
  save(subscription: Subscription): Promise<void>;

  /**
   * Subscriptionを削除する
   * @param id 削除するSubscriptionのID
   */
  delete(id: SubscriptionId): Promise<void>;
}
