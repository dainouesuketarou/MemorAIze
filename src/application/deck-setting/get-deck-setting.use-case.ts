import { DeckSetting } from '../../domain/entity/deck-setting';
import { IDeckSettingRepository } from '../../domain/repository/deck-setting';
import { UserId } from '../../domain/entity/user';
import { DeckId } from '../../domain/entity/deck';

export interface GetDeckSettingRequest {
  userId: UserId;
  deckId: DeckId;
}

export interface GetDeckSettingResponse {
  success: boolean;
  deckSetting?: DeckSetting;
  error?: string;
}

export class GetDeckSettingUseCase {
  constructor(private deckSettingRepository: IDeckSettingRepository) {}

  async execute(
    request: GetDeckSettingRequest,
  ): Promise<GetDeckSettingResponse> {
    try {
      const deckSetting =
        await this.deckSettingRepository.findByUserIdAndDeckId(
          request.userId,
          request.deckId,
        );

      return {
        success: true,
        deckSetting: deckSetting || undefined,
      };
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : 'デッキ設定の取得に失敗しました',
      };
    }
  }
}
