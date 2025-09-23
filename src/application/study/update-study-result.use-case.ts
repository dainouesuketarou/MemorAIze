import { Deck, DeckId } from '../../domain/entity/deck';
import { Card, CardId } from '../../domain/entity/card';
import { IDeckRepository } from '../../domain/repository/deck';
import { ICardRepository } from '../../domain/repository/card';
import { CardStatusValue } from '../../domain/value-object/card-status';

export interface StudyResult {
  id: CardId;
  mastered: boolean;
}

export interface UpdateStudyResultRequest {
  deckId: DeckId;
  results: StudyResult[];
}

export interface UpdateStudyResultResponse {
  success: boolean;
  error?: string;
}

export class UpdateStudyResultUseCase {
  constructor(
    private deckRepository: IDeckRepository,
    private cardRepository: ICardRepository,
  ) {}

  async execute(
    request: UpdateStudyResultRequest,
  ): Promise<UpdateStudyResultResponse> {
    try {
      const deck = await this.deckRepository.findById(request.deckId);

      if (!deck) {
        return {
          success: false,
          error: 'デッキが見つかりません',
        };
      }

      // 各カードのステータスを更新
      for (const result of request.results) {
        const card = deck.cards.find((c) => c.id === result.id);
        if (card) {
          const newStatus = result.mastered
            ? CardStatusValue.mastered()
            : CardStatusValue.struggling();
          card.changeStatus(newStatus);
          await this.cardRepository.save(card, request.deckId);
        }
      }

      // デッキの進捗を更新
      deck.updateProgress();
      await this.deckRepository.save(deck);

      return {
        success: true,
      };
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : '学習結果の更新に失敗しました',
      };
    }
  }
}
