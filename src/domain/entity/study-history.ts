export type StudyHistoryId = string;
export type DeckId = string;

export interface StudyHistoryProps {
  id: StudyHistoryId;
  deckId: DeckId;
  progress: number; // 進捗率（0-100）
  createdAt: Date;
}

export class StudyHistory {
  private readonly _id: StudyHistoryId;
  private readonly _deckId: DeckId;
  private readonly _progress: number;
  private readonly _createdAt: Date;

  private constructor(props: StudyHistoryProps) {
    this._id = props.id;
    this._deckId = props.deckId;
    this._progress = props.progress;
    this._createdAt = props.createdAt;
  }

  /**
   * 新規学習履歴作成
   */
  public static create(
    deckId: DeckId,
    progress: number,
    id: StudyHistoryId,
  ): StudyHistory {
    if (progress < 0 || progress > 100) {
      throw new Error('Progress must be between 0 and 100.');
    }

    return new StudyHistory({
      id,
      deckId,
      progress,
      createdAt: new Date(),
    });
  }

  /**
   * 永続化層からのデータでエンティティを復元
   */
  public static fromPersistence(props: StudyHistoryProps): StudyHistory {
    return new StudyHistory(props);
  }

  get id(): StudyHistoryId {
    return this._id;
  }

  get deckId(): DeckId {
    return this._deckId;
  }

  get progress(): number {
    return this._progress;
  }

  get createdAt(): Date {
    return this._createdAt;
  }
}
