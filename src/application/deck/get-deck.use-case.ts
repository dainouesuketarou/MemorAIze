import { Deck, DeckId } from '../../domain/entity/deck';
import { IDeckRepository } from '../../domain/repository/deck';
import { CardStatusValue } from '../../domain/value-object/card-status';

export interface GetDeckRequest {
  deckId: DeckId;
}

export interface GetDeckResponse {
  success: boolean;
  deck?: Deck;
  stats?: {
    mastered: number;
    struggling: number;
    unlearned: number;
  };
  progressHistory?: Array<{
    progress: number;
    createdAt: Date;
  }>;
  error?: string;
}

export class GetDeckUseCase {
  constructor(private deckRepository: IDeckRepository) {}

  async execute(request: GetDeckRequest): Promise<GetDeckResponse> {
    try {
      const deck = await this.deckRepository.findById(request.deckId);

      if (!deck) {
        return {
          success: false,
          error: 'デッキが見つかりません',
        };
      }

      // カードの統計情報を計算
      const totalCards = deck.cards.length;
      const masteredCount = deck.cards.filter((card) =>
        card.status.isMastered(),
      ).length;
      const strugglingCount = deck.cards.filter((card) =>
        card.status.isStruggling(),
      ).length;
      const unlearnedCount = deck.cards.filter((card) =>
        card.status.isUnlearned(),
      ).length;

      const stats = {
        mastered:
          totalCards > 0 ? Math.round((masteredCount / totalCards) * 100) : 0,
        struggling:
          totalCards > 0 ? Math.round((strugglingCount / totalCards) * 100) : 0,
        unlearned:
          totalCards > 0 ? Math.round((unlearnedCount / totalCards) * 100) : 0,
      };

      return {
        success: true,
        deck,
        stats,
      };
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error ? error.message : 'デッキの取得に失敗しました',
      };
    }
  }
}
