export const FilterMode = {
  UNLEARNED: 'UNLEARNED',
  MASTERED: 'MASTERED',
  STRUGGLING: 'STRUGGLING',
  FAVORITE: 'FAVORITE',
} as const;

export type FilterModeType = (typeof FilterMode)[keyof typeof FilterMode];

export class FilterModeValue {
  private readonly _value: FilterModeType;

  private constructor(value: FilterModeType) {
    this._value = value;
  }

  /**
   * フィルターモードを作成する
   */
  public static create(value: FilterModeType): FilterModeValue {
    if (!Object.values(FilterMode).includes(value)) {
      throw new Error('Invalid filter mode.');
    }
    return new FilterModeValue(value);
  }

  /**
   * 未学習フィルターを作成する
   */
  public static unlearned(): FilterModeValue {
    return new FilterModeValue(FilterMode.UNLEARNED);
  }

  /**
   * 習得済みフィルターを作成する
   */
  public static mastered(): FilterModeValue {
    return new FilterModeValue(FilterMode.MASTERED);
  }

  /**
   * 苦手フィルターを作成する
   */
  public static struggling(): FilterModeValue {
    return new FilterModeValue(FilterMode.STRUGGLING);
  }

  /**
   * お気に入りフィルターを作成する
   */
  public static favorite(): FilterModeValue {
    return new FilterModeValue(FilterMode.FAVORITE);
  }

  get value(): FilterModeType {
    return this._value;
  }

  /**
   * 等価性チェック
   */
  public equals(other: FilterModeValue): boolean {
    return this._value === other._value;
  }

  /**
   * 文字列として取得
   */
  public toString(): string {
    return this._value;
  }
}

/**
 * フィルターモードのコレクション
 */
export class FilterModeCollection {
  private readonly _modes: FilterModeValue[];

  private constructor(modes: FilterModeValue[]) {
    this._modes = modes;
  }

  /**
   * 空のコレクションを作成する
   */
  public static empty(): FilterModeCollection {
    return new FilterModeCollection([]);
  }

  /**
   * フィルターモードの配列からコレクションを作成する
   */
  public static fromArray(modes: FilterModeType[]): FilterModeCollection {
    const filterModes = modes.map((mode) => FilterModeValue.create(mode));
    return new FilterModeCollection(filterModes);
  }

  /**
   * 単一のフィルターモードからコレクションを作成する
   */
  public static fromSingle(mode: FilterModeType): FilterModeCollection {
    return new FilterModeCollection([FilterModeValue.create(mode)]);
  }

  /**
   * 永続化層からのデータでコレクションを復元
   */
  public static fromPersistence(modes: FilterModeType[]): FilterModeCollection {
    return this.fromArray(modes);
  }

  get modes(): FilterModeValue[] {
    return [...this._modes];
  }

  get values(): FilterModeType[] {
    return this._modes.map((mode) => mode.value);
  }

  /**
   * 指定されたフィルターモードが含まれているかチェックする
   */
  public has(mode: FilterModeType): boolean {
    return this._modes.some((m) => m.value === mode);
  }

  /**
   * フィルターモードを追加する
   */
  public add(mode: FilterModeType): FilterModeCollection {
    if (!this.has(mode)) {
      const newModes = [...this._modes, FilterModeValue.create(mode)];
      return new FilterModeCollection(newModes);
    }
    return this;
  }

  /**
   * フィルターモードを削除する
   */
  public remove(mode: FilterModeType): FilterModeCollection {
    const newModes = this._modes.filter((m) => m.value !== mode);
    return new FilterModeCollection(newModes);
  }

  /**
   * コレクションが空かどうか
   */
  public isEmpty(): boolean {
    return this._modes.length === 0;
  }

  /**
   * コレクションのサイズ
   */
  public size(): number {
    return this._modes.length;
  }

  /**
   * 等価性チェック
   */
  public equals(other: FilterModeCollection): boolean {
    if (this._modes.length !== other._modes.length) {
      return false;
    }
    return this._modes.every((mode, index) => mode.equals(other._modes[index]));
  }
}
