import { DeckSetting, DeckSettingId } from '../entity/deck-setting';
import { UserId } from '../entity/user';
import { DeckId } from '../entity/deck';

export interface IDeckSettingRepository {
  /**
   * 新しいIDを生成する
   */
  generateId(): Promise<DeckSettingId>;

  /**
   * IDでDeckSettingを検索する
   * @param id デッキ設定のID
   */
  findById(id: DeckSettingId): Promise<DeckSetting | null>;

  /**
   * ユーザーIDとデッキIDでDeckSettingを検索する
   * @param userId ユーザーのID
   * @param deckId デッキのID
   */
  findByUserIdAndDeckId(
    userId: UserId,
    deckId: DeckId,
  ): Promise<DeckSetting | null>;

  /**
   * ユーザーIDでDeckSettingのリストを検索する
   * @param userId ユーザーのID
   */
  findByUserId(userId: UserId): Promise<DeckSetting[]>;

  /**
   * DeckSettingを保存（新規作成または更新）する
   * @param deckSetting 保存するDeckSettingエンティティ
   */
  save(deckSetting: DeckSetting): Promise<void>;

  /**
   * DeckSettingを削除する
   * @param id 削除するDeckSettingのID
   */
  delete(id: DeckSettingId): Promise<void>;

  /**
   * デッキIDでDeckSettingを一括削除する
   * @param deckId デッキのID
   */
  deleteByDeckId(deckId: DeckId): Promise<void>;
}
