export const CardStatus = {
  UNLEARNED: 'UNLEARNED',
  MASTERED: 'MASTERED',
  STRUGGLING: 'STRUGGLING',
} as const;

export type CardStatusType = (typeof CardStatus)[keyof typeof CardStatus];

export class CardStatusValue {
  private readonly _value: CardStatusType;

  private constructor(value: CardStatusType) {
    this._value = value;
  }

  /**
   * カードステータスを作成する
   */
  public static create(value: CardStatusType): CardStatusValue {
    if (!Object.values(CardStatus).includes(value)) {
      throw new Error('Invalid card status.');
    }
    return new CardStatusValue(value);
  }

  /**
   * 未学習ステータスを作成する
   */
  public static unlearned(): CardStatusValue {
    return new CardStatusValue(CardStatus.UNLEARNED);
  }

  /**
   * 習得済みステータスを作成する
   */
  public static mastered(): CardStatusValue {
    return new CardStatusValue(CardStatus.MASTERED);
  }

  /**
   * 苦手ステータスを作成する
   */
  public static struggling(): CardStatusValue {
    return new CardStatusValue(CardStatus.STRUGGLING);
  }

  get value(): CardStatusType {
    return this._value;
  }

  /**
   * 未学習かどうか
   */
  public isUnlearned(): boolean {
    return this._value === CardStatus.UNLEARNED;
  }

  /**
   * 習得済みかどうか
   */
  public isMastered(): boolean {
    return this._value === CardStatus.MASTERED;
  }

  /**
   * 苦手かどうか
   */
  public isStruggling(): boolean {
    return this._value === CardStatus.STRUGGLING;
  }

  /**
   * 等価性チェック
   */
  public equals(other: CardStatusValue): boolean {
    return this._value === other._value;
  }

  /**
   * 文字列として取得
   */
  public toString(): string {
    return this._value;
  }
}
