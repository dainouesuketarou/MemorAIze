import { Card, CardId } from '../entity/card';
import { DeckId } from '../entity/deck';

export interface ICardRepository {
  /**
   * 新しいIDを生成する
   */
  generateId(): Promise<CardId>;

  /**
   * IDでCardを検索する
   * @param id カードのID
   */
  findById(id: CardId): Promise<Card | null>;

  /**
   * デッキIDでCardのリストを検索する
   * @param deckId デッキのID
   */
  findByDeckId(deckId: DeckId): Promise<Card[]>;

  /**
   * Cardを保存（新規作成または更新）する
   * @param card 保存するCardエンティティ
   * @param deckId デッキのID
   */
  save(card: Card, deckId: DeckId): Promise<void>;

  /**
   * Cardを削除する
   * @param id 削除するCardのID
   */
  delete(id: CardId): Promise<void>;

  /**
   * デッキ内のカードの順序を更新する
   * @param deckId デッキのID
   * @param orderedCardIds 順序付きカードIDの配列
   */
  updateOrder(deckId: DeckId, orderedCardIds: CardId[]): Promise<void>;
}
