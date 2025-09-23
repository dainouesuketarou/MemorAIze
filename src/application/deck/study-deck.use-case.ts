import { Deck, DeckId } from '../../domain/entity/deck';
import { Card, CardId } from '../../domain/entity/card';
import { CardStatusValue } from '../../domain/value-object/card-status';
import { IDeckRepository } from '../../domain/repository/deck';

export interface StudyResult {
  cardId: CardId;
  mastered: boolean;
}

export interface StudyDeckRequest {
  deckId: DeckId;
  results: StudyResult[];
}

export interface StudyDeckResponse {
  success: boolean;
  deck?: Deck;
  error?: string;
}

export class StudyDeckUseCase {
  constructor(private deckRepository: IDeckRepository) {}

  async execute(request: StudyDeckRequest): Promise<StudyDeckResponse> {
    try {
      // デッキを取得
      const deck = await this.deckRepository.findById(request.deckId);
      if (!deck) {
        return {
          success: false,
          error: 'デッキが見つかりません',
        };
      }

      // 各カードの学習結果を更新
      request.results.forEach((result) => {
        const card = deck.cards.find((c) => c.id === result.cardId);
        if (card) {
          const newStatus = result.mastered
            ? CardStatusValue.mastered()
            : CardStatusValue.struggling();
          card.changeStatus(newStatus);
        }
      });

      // デッキの進捗を更新
      deck.updateProgress();

      // 最終学習日時を更新
      deck.updateLastStudied();

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
          error instanceof Error
            ? error.message
            : '学習結果の保存に失敗しました',
      };
    }
  }
}
