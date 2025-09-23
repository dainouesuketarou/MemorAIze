import { DeckSetting, DeckSettingId } from '../../domain/entity/deck-setting';
import { IDeckSettingRepository } from '../../domain/repository/deck-setting';
import { UserId } from '../../domain/entity/user';
import { DeckId } from '../../domain/entity/deck';
import { FilterModeType } from '../../domain/value-object/filter-mode';

export interface UpdateDeckSettingRequest {
  userId: UserId;
  deckId: DeckId;
  autoSpeak?: boolean;
  reverse?: boolean;
  filterMode?: FilterModeType[];
  shuffle?: boolean;
}

export interface UpdateDeckSettingResponse {
  success: boolean;
  deckSetting?: DeckSetting;
  error?: string;
}

export class UpdateDeckSettingUseCase {
  constructor(private deckSettingRepository: IDeckSettingRepository) {}

  async execute(
    request: UpdateDeckSettingRequest,
  ): Promise<UpdateDeckSettingResponse> {
    try {
      // 既存のデッキ設定を取得
      let deckSetting = await this.deckSettingRepository.findByUserIdAndDeckId(
        request.userId,
        request.deckId,
      );

      if (!deckSetting) {
        // 新しいデッキ設定を作成
        const deckSettingId = await this.deckSettingRepository.generateId();
        deckSetting = DeckSetting.create(
          request.userId,
          request.deckId,
          deckSettingId,
        );
      }

      // デッキ設定を更新
      if (request.autoSpeak !== undefined) {
        deckSetting.setAutoSpeak(request.autoSpeak);
      }
      if (request.reverse !== undefined) {
        deckSetting.setReverse(request.reverse);
      }
      if (request.filterMode !== undefined) {
        deckSetting.setFilterMode(request.filterMode);
      }
      if (request.shuffle !== undefined) {
        deckSetting.setShuffle(request.shuffle);
      }

      // デッキ設定を保存
      await this.deckSettingRepository.save(deckSetting);

      return {
        success: true,
        deckSetting,
      };
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : 'デッキ設定の更新に失敗しました',
      };
    }
  }
}
