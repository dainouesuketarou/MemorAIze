export class Email {
  private readonly _value: string;

  private constructor(value: string) {
    this._value = value;
  }

  /**
   * バリデーション付きでEmailを作成する
   */
  public static create(value: string): Email {
    const trimmedValue = value.trim();
    if (!this.isValid(trimmedValue)) {
      throw new Error('Invalid email format.');
    }
    return new Email(trimmedValue.toLowerCase());
  }

  /**
   * バリデーションなしでEmailを作成する（既存データからの復元用）
   */
  public static fromString(value: string): Email {
    return new Email(value);
  }

  /**
   * メールアドレスの形式チェック
   */
  private static isValid(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  get value(): string {
    return this._value;
  }

  /**
   * 文字列として取得
   */
  toString(): string {
    return this._value;
  }

  /**
   * 等価性チェック
   */
  equals(other: Email): boolean {
    return this._value === other._value;
  }
}
