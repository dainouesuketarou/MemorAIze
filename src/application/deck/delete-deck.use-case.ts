import { Deck, DeckId } from '../../domain/entity/deck';
import { IDeckRepository } from '../../domain/repository/deck';
import { ICardRepository } from '../../domain/repository/card';
import { IStudyHistoryRepository } from '../../domain/repository/study-history';
import { IDeckSettingRepository } from '../../domain/repository/deck-setting';
import { UserId } from '../../domain/entity/user';

export interface DeleteDeckRequest {
  deckId: DeckId;
  userId: UserId;
}

export interface DeleteDeckResponse {
  success: boolean;
  error?: string;
}

export class DeleteDeckUseCase {
  constructor(
    private deckRepository: IDeckRepository,
    private cardRepository: ICardRepository,
    private studyHistoryRepository: IStudyHistoryRepository,
    private deckSettingRepository: IDeckSettingRepository,
  ) {}

  async execute(request: DeleteDeckRequest): Promise<DeleteDeckResponse> {
    try {
      // デッキの存在確認と所有者確認
      const deck = await this.deckRepository.findById(request.deckId);

      if (!deck) {
        return {
          success: false,
          error: 'デッキが見つかりません',
        };
      }

      if (deck.userId !== request.userId) {
        return {
          success: false,
          error: 'このデッキを削除する権限がありません',
        };
      }

      // デッキに関連するカードを削除
      const cards = deck.cards;
      for (const card of cards) {
        await this.cardRepository.delete(card.id);
      }

      // デッキに関連する学習履歴を削除
      await this.studyHistoryRepository.deleteByDeckId(request.deckId);

      // デッキ設定を削除
      await this.deckSettingRepository.deleteByDeckId(request.deckId);

      // デッキを削除
      await this.deckRepository.delete(request.deckId);

      return {
        success: true,
      };
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error ? error.message : 'デッキの削除に失敗しました',
      };
    }
  }
}
