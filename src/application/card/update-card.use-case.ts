import { Card, CardId } from '../../domain/entity/card';
import { ICardRepository } from '../../domain/repository/card';
import { CardStatusValue } from '../../domain/value-object/card-status';

export interface UpdateCardRequest {
  cardId: CardId;
  deckId: string; // カードが属するデッキのID
  front?: string;
  back?: string;
  status?: CardStatusValue;
  isFavorite?: boolean;
  order?: number;
}

export interface UpdateCardResponse {
  success: boolean;
  card?: Card;
  error?: string;
}

export class UpdateCardUseCase {
  constructor(private cardRepository: ICardRepository) {}

  async execute(request: UpdateCardRequest): Promise<UpdateCardResponse> {
    try {
      // カードを取得
      const card = await this.cardRepository.findById(request.cardId);
      if (!card) {
        return {
          success: false,
          error: 'カードが見つかりません',
        };
      }

      // カードの内容を更新
      if (request.front !== undefined || request.back !== undefined) {
        card.updateContent({
          front: request.front,
          back: request.back,
        });
      }

      // カードのステータスを更新
      if (request.status !== undefined) {
        card.changeStatus(request.status);
      }

      // カードのお気に入り状態を更新
      if (request.isFavorite !== undefined) {
        const currentFavorite = card.isFavorite;
        if (currentFavorite !== request.isFavorite) {
          card.toggleFavorite();
        }
      }

      // カードの順序を更新
      if (request.order !== undefined) {
        card.changeOrder(request.order);
      }

      // カードを保存
      await this.cardRepository.save(card, request.deckId);

      return {
        success: true,
        card,
      };
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error ? error.message : 'カードの更新に失敗しました',
      };
    }
  }
}
