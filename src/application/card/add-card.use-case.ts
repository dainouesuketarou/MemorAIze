import { Deck, DeckId } from '../../domain/entity/deck';
import { Card } from '../../domain/entity/card';
import { IDeckRepository } from '../../domain/repository/deck';
import { nanoid } from 'nanoid';

export interface AddCardRequest {
  deckId: DeckId;
  front: string;
  back: string;
}

export interface AddCardResponse {
  success: boolean;
  card?: Card;
  error?: string;
}

export class AddCardUseCase {
  constructor(private deckRepository: IDeckRepository) {}

  async execute(request: AddCardRequest): Promise<AddCardResponse> {
    try {
      // デッキを取得
      const deck = await this.deckRepository.findById(request.deckId);
      if (!deck) {
        return {
          success: false,
          error: 'デッキが見つかりません',
        };
      }

      // 新しいカードを作成
      const newCard = Card.create(
        {
          front: request.front,
          back: request.back,
          order: deck.cards.length, // 最後に追加
        },
        `card_${nanoid()}`,
      );

      // デッキにカードを追加
      deck.addCard(
        {
          front: newCard.front,
          back: newCard.back,
        },
        newCard.id,
      );

      // デッキを保存（カードの追加も含めて）
      await this.deckRepository.save(deck);

      return {
        success: true,
        card: newCard,
      };
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error ? error.message : 'カードの追加に失敗しました',
      };
    }
  }
}
