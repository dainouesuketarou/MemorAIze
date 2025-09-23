export const SubscriptionPlan = {
  FREE: 'FREE',
  PRO_MONTHLY: 'PRO_MONTHLY',
  PRO_YEARLY: 'PRO_YEARLY',
} as const;

export type SubscriptionPlanType =
  (typeof SubscriptionPlan)[keyof typeof SubscriptionPlan];

export class SubscriptionPlanValue {
  private readonly _value: SubscriptionPlanType;

  private constructor(value: SubscriptionPlanType) {
    this._value = value;
  }

  /**
   * サブスクリプションプランを作成する
   */
  public static create(value: SubscriptionPlanType): SubscriptionPlanValue {
    if (!Object.values(SubscriptionPlan).includes(value)) {
      throw new Error('Invalid subscription plan.');
    }
    return new SubscriptionPlanValue(value);
  }

  /**
   * 無料プランを作成する
   */
  public static free(): SubscriptionPlanValue {
    return new SubscriptionPlanValue(SubscriptionPlan.FREE);
  }

  /**
   * プロ月額プランを作成する
   */
  public static proMonthly(): SubscriptionPlanValue {
    return new SubscriptionPlanValue(SubscriptionPlan.PRO_MONTHLY);
  }

  /**
   * プロ年額プランを作成する
   */
  public static proYearly(): SubscriptionPlanValue {
    return new SubscriptionPlanValue(SubscriptionPlan.PRO_YEARLY);
  }

  get value(): SubscriptionPlanType {
    return this._value;
  }

  /**
   * 無料プランかどうか
   */
  public isFree(): boolean {
    return this._value === SubscriptionPlan.FREE;
  }

  /**
   * プロプランかどうか
   */
  public isPro(): boolean {
    return (
      this._value === SubscriptionPlan.PRO_MONTHLY ||
      this._value === SubscriptionPlan.PRO_YEARLY
    );
  }

  /**
   * 月額プランかどうか
   */
  public isMonthly(): boolean {
    return this._value === SubscriptionPlan.PRO_MONTHLY;
  }

  /**
   * 年額プランかどうか
   */
  public isYearly(): boolean {
    return this._value === SubscriptionPlan.PRO_YEARLY;
  }

  /**
   * 等価性チェック
   */
  public equals(other: SubscriptionPlanValue): boolean {
    return this._value === other._value;
  }

  /**
   * 文字列として取得
   */
  public toString(): string {
    return this._value;
  }

  /**
   * 日本語表示名を取得する
   */
  public getDisplayName(): string {
    switch (this._value) {
      case SubscriptionPlan.FREE:
        return '無料プラン';
      case SubscriptionPlan.PRO_MONTHLY:
        return 'プロ月額プラン';
      case SubscriptionPlan.PRO_YEARLY:
        return 'プロ年額プラン';
      default:
        return this._value;
    }
  }
}
