import { UserId } from './user';

export type GroupId = string;

export interface GroupProps {
  id: GroupId;
  name: string;
  description: string | null;
  userId: UserId;
  deckIds: string[];
}

export class Group {
  private readonly _id: GroupId;
  private readonly _userId: UserId;
  private _name: string;
  private _description: string | null;
  private _deckIds: string[];

  private constructor(props: GroupProps) {
    this._id = props.id;
    this._userId = props.userId;
    this._name = props.name;
    this._description = props.description;
    this._deckIds = props.deckIds;
  }

  /**
   * 新規グループ作成
   */
  public static create(
    props: {
      name: string;
      description?: string | null;
      userId: UserId;
    },
    id: GroupId,
  ): Group {
    if (!props.name.trim()) {
      throw new Error('Group name cannot be empty.');
    }

    return new Group({
      id,
      name: props.name.trim(),
      description: props.description ?? null,
      userId: props.userId,
      deckIds: [],
    });
  }

  /**
   * 永続化層からのデータでエンティティを復元
   */
  public static fromPersistence(props: GroupProps): Group {
    return new Group(props);
  }

  get id(): GroupId {
    return this._id;
  }

  get userId(): UserId {
    return this._userId;
  }

  get name(): string {
    return this._name;
  }

  get description(): string | null {
    return this._description;
  }

  get deckIds(): string[] {
    return [...this._deckIds];
  }

  /**
   * グループ名を変更する
   */
  public changeName(name: string) {
    if (!name.trim()) {
      throw new Error('Group name cannot be empty.');
    }
    this._name = name.trim();
  }

  /**
   * グループの説明を変更する
   */
  public changeDescription(description: string | null) {
    this._description = description;
  }

  /**
   * デッキをグループに追加する
   */
  public addDeck(deckId: string) {
    if (!this._deckIds.includes(deckId)) {
      this._deckIds.push(deckId);
    }
  }

  /**
   * デッキをグループから削除する
   */
  public removeDeck(deckId: string) {
    this._deckIds = this._deckIds.filter((id) => id !== deckId);
  }

  /**
   * デッキがグループに属しているかチェックする
   */
  public hasDeck(deckId: string): boolean {
    return this._deckIds.includes(deckId);
  }
}
