import { StudyHistory } from '../../domain/entity/study-history';
import { IStudyHistoryRepository } from '../../domain/repository/study-history';
import { DeckId } from '../../domain/entity/deck';

export interface GetDeckStudyHistoryRequest {
  deckId: DeckId;
  startDate?: Date;
  endDate?: Date;
}

export interface GetDeckStudyHistoryResponse {
  success: boolean;
  studyHistories?: StudyHistory[];
  error?: string;
}

export class GetDeckStudyHistoryUseCase {
  constructor(private studyHistoryRepository: IStudyHistoryRepository) {}

  async execute(
    request: GetDeckStudyHistoryRequest,
  ): Promise<GetDeckStudyHistoryResponse> {
    try {
      let studyHistories: StudyHistory[];

      if (request.startDate && request.endDate) {
        // 日付範囲で学習履歴を取得
        studyHistories =
          await this.studyHistoryRepository.findByDeckIdAndDateRange(
            request.deckId,
            request.startDate,
            request.endDate,
          );
      } else {
        // デッキの全学習履歴を取得
        studyHistories = await this.studyHistoryRepository.findByDeckId(
          request.deckId,
        );
      }

      return {
        success: true,
        studyHistories,
      };
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : '学習履歴の取得に失敗しました',
      };
    }
  }
}
