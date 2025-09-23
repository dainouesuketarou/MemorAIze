import {
  SubscriptionPlanValue,
  SubscriptionPlanType,
} from '../value-object/subscription-plan';
import {
  SubscriptionStatusValue,
  SubscriptionStatusType,
} from '../value-object/subscription-status';

export type SubscriptionId = string;
export type UserId = string;

export interface SubscriptionProps {
  id: SubscriptionId;
  userId: UserId;
  stripeSubscriptionId: string | null;
  stripePriceId: string | null;
  stripeCurrentPeriodEnd: Date | null;
  plan: SubscriptionPlanValue;
  status: SubscriptionStatusValue;
  cancelAtPeriodEnd: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export class Subscription {
  private readonly _id: SubscriptionId;
  private readonly _userId: UserId;
  private _stripeSubscriptionId: string | null;
  private _stripePriceId: string | null;
  private _stripeCurrentPeriodEnd: Date | null;
  private _plan: SubscriptionPlanValue;
  private _status: SubscriptionStatusValue;
  private _cancelAtPeriodEnd: boolean;
  private readonly _createdAt: Date;
  private _updatedAt: Date;

  private constructor(props: SubscriptionProps) {
    this._id = props.id;
    this._userId = props.userId;
    this._stripeSubscriptionId = props.stripeSubscriptionId;
    this._stripePriceId = props.stripePriceId;
    this._stripeCurrentPeriodEnd = props.stripeCurrentPeriodEnd;
    this._plan = props.plan;
    this._status = props.status;
    this._cancelAtPeriodEnd = props.cancelAtPeriodEnd;
    this._createdAt = props.createdAt;
    this._updatedAt = props.updatedAt;
  }

  /**
   * 新規サブスクリプション作成（無料プラン）
   */
  public static createFree(userId: UserId, id: SubscriptionId): Subscription {
    return new Subscription({
      id,
      userId,
      stripeSubscriptionId: null,
      stripePriceId: null,
      stripeCurrentPeriodEnd: null,
      plan: SubscriptionPlanValue.free(),
      status: SubscriptionStatusValue.active(),
      cancelAtPeriodEnd: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }

  /**
   * 永続化層からのデータでエンティティを復元
   */
  public static fromPersistence(props: SubscriptionProps): Subscription {
    return new Subscription(props);
  }

  get id(): SubscriptionId {
    return this._id;
  }

  get userId(): UserId {
    return this._userId;
  }

  get stripeSubscriptionId(): string | null {
    return this._stripeSubscriptionId;
  }

  get stripePriceId(): string | null {
    return this._stripePriceId;
  }

  get stripeCurrentPeriodEnd(): Date | null {
    return this._stripeCurrentPeriodEnd;
  }

  get plan(): SubscriptionPlanValue {
    return this._plan;
  }

  get status(): SubscriptionStatusValue {
    return this._status;
  }

  get cancelAtPeriodEnd(): boolean {
    return this._cancelAtPeriodEnd;
  }

  get createdAt(): Date {
    return this._createdAt;
  }

  get updatedAt(): Date {
    return this._updatedAt;
  }

  /**
   * サブスクリプションがアクティブかどうか
   */
  public isActive(): boolean {
    return this._status.isValid();
  }

  /**
   * プロプランかどうか
   */
  public isProPlan(): boolean {
    return this._plan.isPro();
  }

  /**
   * サブスクリプションをアクティブにする
   */
  public activate(
    stripeSubscriptionId: string,
    stripePriceId: string,
    currentPeriodEnd: Date,
    plan: SubscriptionPlanType,
  ) {
    this._stripeSubscriptionId = stripeSubscriptionId;
    this._stripePriceId = stripePriceId;
    this._stripeCurrentPeriodEnd = currentPeriodEnd;
    this._plan = SubscriptionPlanValue.create(plan);
    this._status = SubscriptionStatusValue.active();
    this._cancelAtPeriodEnd = false;
    this._updatedAt = new Date();
  }

  /**
   * サブスクリプションをキャンセルする
   */
  public cancel(cancelAtPeriodEnd: boolean = false) {
    if (cancelAtPeriodEnd) {
      this._cancelAtPeriodEnd = true;
    } else {
      this._status = SubscriptionStatusValue.canceled();
    }
    this._updatedAt = new Date();
  }

  /**
   * サブスクリプションプランを変更する
   */
  public changePlan(
    plan: SubscriptionPlanType,
    stripePriceId: string,
    currentPeriodEnd: Date,
  ) {
    this._plan = SubscriptionPlanValue.create(plan);
    this._stripePriceId = stripePriceId;
    this._stripeCurrentPeriodEnd = currentPeriodEnd;
    this._updatedAt = new Date();
  }

  /**
   * サブスクリプションステータスを更新する
   */
  public updateStatus(status: SubscriptionStatusType) {
    this._status = SubscriptionStatusValue.create(status);
    this._updatedAt = new Date();
  }
}
