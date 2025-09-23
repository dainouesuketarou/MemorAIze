export const SubscriptionStatus = {
  ACTIVE: 'ACTIVE',
  CANCELED: 'CANCELED',
  PAST_DUE: 'PAST_DUE',
  UNPAID: 'UNPAID',
  TRIALING: 'TRIALING',
} as const;

export type SubscriptionStatusType =
  (typeof SubscriptionStatus)[keyof typeof SubscriptionStatus];

export class SubscriptionStatusValue {
  private readonly _value: SubscriptionStatusType;

  private constructor(value: SubscriptionStatusType) {
    this._value = value;
  }

  /**
   * サブスクリプションステータスを作成する
   */
  public static create(value: SubscriptionStatusType): SubscriptionStatusValue {
    if (!Object.values(SubscriptionStatus).includes(value)) {
      throw new Error('Invalid subscription status.');
    }
    return new SubscriptionStatusValue(value);
  }

  /**
   * アクティブステータスを作成する
   */
  public static active(): SubscriptionStatusValue {
    return new SubscriptionStatusValue(SubscriptionStatus.ACTIVE);
  }

  /**
   * キャンセル済みステータスを作成する
   */
  public static canceled(): SubscriptionStatusValue {
    return new SubscriptionStatusValue(SubscriptionStatus.CANCELED);
  }

  /**
   * 期限切れステータスを作成する
   */
  public static pastDue(): SubscriptionStatusValue {
    return new SubscriptionStatusValue(SubscriptionStatus.PAST_DUE);
  }

  /**
   * 未払いステータスを作成する
   */
  public static unpaid(): SubscriptionStatusValue {
    return new SubscriptionStatusValue(SubscriptionStatus.UNPAID);
  }

  /**
   * トライアル中ステータスを作成する
   */
  public static trialing(): SubscriptionStatusValue {
    return new SubscriptionStatusValue(SubscriptionStatus.TRIALING);
  }

  get value(): SubscriptionStatusType {
    return this._value;
  }

  /**
   * アクティブかどうか
   */
  public isActive(): boolean {
    return this._value === SubscriptionStatus.ACTIVE;
  }

  /**
   * キャンセル済みかどうか
   */
  public isCanceled(): boolean {
    return this._value === SubscriptionStatus.CANCELED;
  }

  /**
   * 期限切れかどうか
   */
  public isPastDue(): boolean {
    return this._value === SubscriptionStatus.PAST_DUE;
  }

  /**
   * 未払いかどうか
   */
  public isUnpaid(): boolean {
    return this._value === SubscriptionStatus.UNPAID;
  }

  /**
   * トライアル中かどうか
   */
  public isTrialing(): boolean {
    return this._value === SubscriptionStatus.TRIALING;
  }

  /**
   * 有効な状態かどうか（アクティブまたはトライアル中）
   */
  public isValid(): boolean {
    return this.isActive() || this.isTrialing();
  }

  /**
   * 等価性チェック
   */
  public equals(other: SubscriptionStatusValue): boolean {
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
      case SubscriptionStatus.ACTIVE:
        return 'アクティブ';
      case SubscriptionStatus.CANCELED:
        return 'キャンセル済み';
      case SubscriptionStatus.PAST_DUE:
        return '期限切れ';
      case SubscriptionStatus.UNPAID:
        return '未払い';
      case SubscriptionStatus.TRIALING:
        return 'トライアル中';
      default:
        return this._value;
    }
  }
}
