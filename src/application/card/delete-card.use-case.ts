import { CardId } from '../../domain/entity/card';
import { DeckId } from '../../domain/entity/deck';
import { IDeckRepository } from '../../domain/repository/deck';
import { ICardRepository } from '../../domain/repository/card';

export interface DeleteCardRequest {
  cardId: CardId;
  deckId: DeckId;
}

export interface DeleteCardResponse {
  success: boolean;
  error?: string;
}

export class DeleteCardUseCase {
  constructor(
    private deckRepository: IDeckRepository,
    private cardRepository: ICardRepository,
  ) {}

  async execute(request: DeleteCardRequest): Promise<DeleteCardResponse> {
    try {
      // カードの存在確認
      const card = await this.cardRepository.findById(request.cardId);
      if (!card) {
        return {
          success: false,
          error: 'カードが見つかりません',
        };
      }

      // デッキの存在確認
      const deck = await this.deckRepository.findById(request.deckId);
      if (!deck) {
        return {
          success: false,
          error: 'デッキが見つかりません',
        };
      }

      // カードを削除
      await this.cardRepository.delete(request.cardId);

      // デッキからカードを削除（集約の整合性を保つ）
      deck.removeCard(request.cardId);

      // デッキの進捗を更新
      deck.updateProgress();

      // デッキを保存
      await this.deckRepository.save(deck);

      return {
        success: true,
      };
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error ? error.message : 'カードの削除に失敗しました',
      };
    }
  }
}
