import { Card } from '../../domain/entity/card';
import { DeckId } from '../../domain/entity/deck';
import { IDeckRepository } from '../../domain/repository/deck';
import { ICardRepository } from '../../domain/repository/card';
import { nanoid } from 'nanoid';

export interface SaveCardsRequest {
  deckId: DeckId;
  cards: Array<{
    front: string;
    back: string;
  }>;
}

export interface SaveCardsResponse {
  success: boolean;
  cards?: Card[];
  error?: string;
}

export class SaveCardsUseCase {
  constructor(
    private deckRepository: IDeckRepository,
    private cardRepository: ICardRepository,
  ) {}

  async execute(request: SaveCardsRequest): Promise<SaveCardsResponse> {
    try {
      // デッキの存在確認
      const deck = await this.deckRepository.findById(request.deckId);
      if (!deck) {
        return {
          success: false,
          error: 'デッキが見つかりません',
        };
      }

      // カードエンティティを作成
      const cards = request.cards.map((cardData, index) => {
        return Card.create(
          {
            front: cardData.front,
            back: cardData.back,
            order: index,
          },
          `card_${nanoid()}`,
        );
      });

      // カードを一括保存
      await Promise.all(
        cards.map((card) => this.cardRepository.save(card, request.deckId)),
      );

      // デッキにカードを追加
      cards.forEach((card) => {
        deck.addCard(
          {
            front: card.front,
            back: card.back,
          },
          card.id,
        );
      });

      // デッキを保存
      await this.deckRepository.save(deck);

      return {
        success: true,
        cards,
      };
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error ? error.message : 'カードの保存に失敗しました',
      };
    }
  }
}
