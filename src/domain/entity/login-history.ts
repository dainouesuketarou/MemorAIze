export type LoginHistoryId = string;
export type UserId = string;

export interface LoginHistoryProps {
  id: LoginHistoryId;
  userId: UserId;
  loginAt: Date;
  createdAt: Date;
}

export class LoginHistory {
  private readonly _id: LoginHistoryId;
  private readonly _userId: UserId;
  private readonly _loginAt: Date;
  private readonly _createdAt: Date;

  private constructor(props: LoginHistoryProps) {
    this._id = props.id;
    this._userId = props.userId;
    this._loginAt = props.loginAt;
    this._createdAt = props.createdAt;
  }

  /**
   * 新規ログイン履歴作成
   */
  public static create(
    userId: UserId,
    id: LoginHistoryId,
    loginAt?: Date,
  ): LoginHistory {
    const now = new Date();
    return new LoginHistory({
      id,
      userId,
      loginAt: loginAt || now,
      createdAt: now,
    });
  }

  /**
   * 永続化層からのデータでエンティティを復元
   */
  public static fromPersistence(props: LoginHistoryProps): LoginHistory {
    return new LoginHistory(props);
  }

  get id(): LoginHistoryId {
    return this._id;
  }

  get userId(): UserId {
    return this._userId;
  }

  get loginAt(): Date {
    return this._loginAt;
  }

  get createdAt(): Date {
    return this._createdAt;
  }
}
