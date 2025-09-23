export type AiGenerationLimitId = string;
export type UserId = string;

export interface AiGenerationLimitProps {
  id: AiGenerationLimitId;
  userId: UserId;
  month: Date;
  count: number;
  createdAt: Date;
  updatedAt: Date;
}

export class AiGenerationLimit {
  private readonly _id: AiGenerationLimitId;
  private readonly _userId: UserId;
  private readonly _month: Date;
  private _count: number;
  private readonly _createdAt: Date;
  private _updatedAt: Date;

  private constructor(props: AiGenerationLimitProps) {
    this._id = props.id;
    this._userId = props.userId;
    this._month = props.month;
    this._count = props.count;
    this._createdAt = props.createdAt;
    this._updatedAt = props.updatedAt;
  }

  /**
   * 新規AI生成制限作成
   */
  public static create(
    userId: UserId,
    month: Date,
    id: AiGenerationLimitId,
  ): AiGenerationLimit {
    return new AiGenerationLimit({
      id,
      userId,
      month,
      count: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }

  /**
   * 永続化層からのデータでエンティティを復元
   */
  public static fromPersistence(
    props: AiGenerationLimitProps,
  ): AiGenerationLimit {
    return new AiGenerationLimit(props);
  }

  get id(): AiGenerationLimitId {
    return this._id;
  }

  get userId(): UserId {
    return this._userId;
  }

  get month(): Date {
    return this._month;
  }

  get count(): number {
    return this._count;
  }

  get createdAt(): Date {
    return this._createdAt;
  }

  get updatedAt(): Date {
    return this._updatedAt;
  }

  /**
   * 生成回数を増加させる
   */
  public increment(): void {
    this._count += 1;
    this._updatedAt = new Date();
  }

  /**
   * 生成回数を設定する
   */
  public setCount(count: number): void {
    if (count < 0) {
      throw new Error('Count cannot be negative.');
    }
    this._count = count;
    this._updatedAt = new Date();
  }

  /**
   * 指定された月の制限に達しているかチェックする
   */
  public isLimitReached(limit: number): boolean {
    return this._count >= limit;
  }

  /**
   * 月の開始日を取得する
   */
  public getMonthStart(): Date {
    return new Date(this._month.getFullYear(), this._month.getMonth(), 1);
  }

  /**
   * 月の終了日を取得する
   */
  public getMonthEnd(): Date {
    return new Date(this._month.getFullYear(), this._month.getMonth() + 1, 0);
  }
}
