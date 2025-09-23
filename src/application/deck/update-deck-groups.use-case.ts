import { Deck, DeckId } from '../../domain/entity/deck';
import { IDeckRepository } from '../../domain/repository/deck';
import { UserId } from '../../domain/entity/user';

export interface UpdateDeckGroupsRequest {
  deckId: DeckId;
  userId: UserId;
  groupIds: string[];
}

export interface UpdateDeckGroupsResponse {
  success: boolean;
  deck?: Deck;
  error?: string;
}

export class UpdateDeckGroupsUseCase {
  constructor(private deckRepository: IDeckRepository) {}

  async execute(
    request: UpdateDeckGroupsRequest,
  ): Promise<UpdateDeckGroupsResponse> {
    try {
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
          error: 'このデッキを更新する権限がありません',
        };
      }

      // デッキのグループIDを更新
      deck.updateGroupIds(request.groupIds);

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
            : 'デッキのグループ更新に失敗しました',
      };
    }
  }
}
