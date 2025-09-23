import { Deck, DeckId, UserId } from "../entity/deck";

export interface IDeckRepository {
  /**
   * 新しいIDを生成する
   */
  generateId(): Promise<DeckId>;

  /**
   * IDでDeckを検索する
   * @param id DeckのID
   */
  findById(id: DeckId): Promise<Deck | null>;

  /**
   * ユーザーIDでDeckのリストを検索する
   * @param userId ユーザーのID
   */
  findByUserId(userId: UserId): Promise<Deck[]>;

  /**
   * Deckを保存（新規作成または更新）する
   * @param deck 保存するDeckエンティティ
   */
  save(deck: Deck): Promise<void>;

  /**
   * Deckを削除する
   * @param id 削除するDeckのID
   */
  delete(id: DeckId): Promise<void>;
}
