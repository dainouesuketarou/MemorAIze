import { Deck, DeckId, UserId } from '../../domain/entity/deck';
import { Card } from '../../domain/entity/card';
import { IDeckRepository } from '../../domain/repository/deck';
import { nanoid } from 'nanoid';

export interface CreateDeckRequest {
  title: string;
  cards: Array<{
    front: string;
    back: string;
  }>;
  userId: UserId;
  groupIds?: string[];
}

export interface CreateDeckResponse {
  success: boolean;
  deck?: Deck;
  error?: string;
}

export class CreateDeckUseCase {
  constructor(private deckRepository: IDeckRepository) {}

  async execute(request: CreateDeckRequest): Promise<CreateDeckResponse> {
    try {
      // 新しいデッキIDを生成
      const deckId = await this.deckRepository.generateId();

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

      // デッキエンティティを作成
      const deck = Deck.create(
        {
          title: request.title,
          userId: request.userId,
        },
        deckId,
      );

      // グループIDを設定（提供されている場合）
      if (request.groupIds && request.groupIds.length > 0) {
        deck.updateGroupIds(request.groupIds);
      }

      // カードをデッキに追加
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
        deck,
      };
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error ? error.message : 'デッキの作成に失敗しました',
      };
    }
  }
}
