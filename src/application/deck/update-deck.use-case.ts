import { Deck, DeckId } from '../../domain/entity/deck';
import { IDeckRepository } from '../../domain/repository/deck';

export interface UpdateDeckRequest {
  deckId: DeckId;
  title?: string;
  description?: string | null;
}

export interface UpdateDeckResponse {
  success: boolean;
  deck?: Deck;
  error?: string;
}

export class UpdateDeckUseCase {
  constructor(private deckRepository: IDeckRepository) {}

  async execute(request: UpdateDeckRequest): Promise<UpdateDeckResponse> {
    try {
      // デッキを取得
      const deck = await this.deckRepository.findById(request.deckId);
      if (!deck) {
        return {
          success: false,
          error: 'デッキが見つかりません',
        };
      }

      // デッキのタイトルを更新
      if (request.title !== undefined) {
        deck.changeTitle(request.title);
      }

      // デッキの説明を更新
      if (request.description !== undefined) {
        deck.changeDescription(request.description);
      }

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
          error instanceof Error ? error.message : 'デッキの更新に失敗しました',
      };
    }
  }
}
