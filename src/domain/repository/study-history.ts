import { StudyHistory, StudyHistoryId } from '../entity/study-history';
import { DeckId } from '../entity/deck';

export interface IStudyHistoryRepository {
  /**
   * 新しいIDを生成する
   */
  generateId(): Promise<StudyHistoryId>;

  /**
   * IDでStudyHistoryを検索する
   * @param id 学習履歴のID
   */
  findById(id: StudyHistoryId): Promise<StudyHistory | null>;

  /**
   * デッキIDでStudyHistoryのリストを検索する
   * @param deckId デッキのID
   */
  findByDeckId(deckId: DeckId): Promise<StudyHistory[]>;

  /**
   * デッキIDで最新のStudyHistoryを検索する
   * @param deckId デッキのID
   */
  findLatestByDeckId(deckId: DeckId): Promise<StudyHistory | null>;

  /**
   * 指定期間のStudyHistoryのリストを検索する
   * @param deckId デッキのID
   * @param startDate 開始日
   * @param endDate 終了日
   */
  findByDeckIdAndDateRange(
    deckId: DeckId,
    startDate: Date,
    endDate: Date,
  ): Promise<StudyHistory[]>;

  /**
   * StudyHistoryを保存（新規作成または更新）する
   * @param studyHistory 保存するStudyHistoryエンティティ
   */
  save(studyHistory: StudyHistory): Promise<void>;

  /**
   * StudyHistoryを削除する
   * @param id 削除するStudyHistoryのID
   */
  delete(id: StudyHistoryId): Promise<void>;

  /**
   * デッキIDでStudyHistoryを一括削除する
   * @param deckId デッキのID
   */
  deleteByDeckId(deckId: DeckId): Promise<void>;
}
