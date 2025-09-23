import {
  FilterModeCollection,
  FilterModeType,
} from '../value-object/filter-mode';

export type DeckSettingId = string;
export type UserId = string;
export type DeckId = string;

export interface DeckSettingProps {
  id: DeckSettingId;
  userId: UserId;
  deckId: DeckId;
  autoSpeak: boolean;
  reverse: boolean;
  filterMode: FilterModeCollection;
  shuffle: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export class DeckSetting {
  private readonly _id: DeckSettingId;
  private readonly _userId: UserId;
  private readonly _deckId: DeckId;
  private _autoSpeak: boolean;
  private _reverse: boolean;
  private _filterMode: FilterModeCollection;
  private _shuffle: boolean;
  private readonly _createdAt: Date;
  private _updatedAt: Date;

  private constructor(props: DeckSettingProps) {
    this._id = props.id;
    this._userId = props.userId;
    this._deckId = props.deckId;
    this._autoSpeak = props.autoSpeak;
    this._reverse = props.reverse;
    this._filterMode = props.filterMode;
    this._shuffle = props.shuffle;
    this._createdAt = props.createdAt;
    this._updatedAt = props.updatedAt;
  }

  /**
   * 新規デッキ設定作成
   */
  public static create(
    userId: UserId,
    deckId: DeckId,
    id: DeckSettingId,
  ): DeckSetting {
    return new DeckSetting({
      id,
      userId,
      deckId,
      autoSpeak: false,
      reverse: false,
      filterMode: FilterModeCollection.empty(),
      shuffle: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }

  /**
   * 永続化層からのデータでエンティティを復元
   */
  public static fromPersistence(props: DeckSettingProps): DeckSetting {
    return new DeckSetting(props);
  }

  get id(): DeckSettingId {
    return this._id;
  }

  get userId(): UserId {
    return this._userId;
  }

  get deckId(): DeckId {
    return this._deckId;
  }

  get autoSpeak(): boolean {
    return this._autoSpeak;
  }

  get reverse(): boolean {
    return this._reverse;
  }

  get filterMode(): FilterModeCollection {
    return this._filterMode;
  }

  get shuffle(): boolean {
    return this._shuffle;
  }

  get createdAt(): Date {
    return this._createdAt;
  }

  get updatedAt(): Date {
    return this._updatedAt;
  }

  /**
   * 自動読み上げ設定を変更する
   */
  public setAutoSpeak(autoSpeak: boolean) {
    this._autoSpeak = autoSpeak;
    this._updatedAt = new Date();
  }

  /**
   * 逆方向学習設定を変更する
   */
  public setReverse(reverse: boolean) {
    this._reverse = reverse;
    this._updatedAt = new Date();
  }

  /**
   * フィルターモードを設定する
   */
  public setFilterMode(filterMode: FilterModeType[]) {
    this._filterMode = FilterModeCollection.fromArray(filterMode);
    this._updatedAt = new Date();
  }

  /**
   * シャッフル設定を変更する
   */
  public setShuffle(shuffle: boolean) {
    this._shuffle = shuffle;
    this._updatedAt = new Date();
  }

  /**
   * 特定のフィルターモードが設定されているかチェックする
   */
  public hasFilterMode(mode: FilterModeType): boolean {
    return this._filterMode.has(mode);
  }

  /**
   * フィルターモードを追加する
   */
  public addFilterMode(mode: FilterModeType) {
    this._filterMode = this._filterMode.add(mode);
    this._updatedAt = new Date();
  }

  /**
   * フィルターモードを削除する
   */
  public removeFilterMode(mode: FilterModeType) {
    this._filterMode = this._filterMode.remove(mode);
    this._updatedAt = new Date();
  }
}
