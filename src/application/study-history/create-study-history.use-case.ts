import {
  StudyHistory,
  StudyHistoryId,
} from '../../domain/entity/study-history';
import { IStudyHistoryRepository } from '../../domain/repository/study-history';
import { DeckId } from '../../domain/entity/deck';

export interface CreateStudyHistoryRequest {
  deckId: DeckId;
  progress?: number;
}

export interface CreateStudyHistoryResponse {
  success: boolean;
  studyHistory?: StudyHistory;
  error?: string;
}

export class CreateStudyHistoryUseCase {
  constructor(private studyHistoryRepository: IStudyHistoryRepository) {}

  async execute(
    request: CreateStudyHistoryRequest,
  ): Promise<CreateStudyHistoryResponse> {
    try {
      const progress = request.progress ?? 0;

      // 進捗の範囲チェック
      if (progress < 0 || progress > 100) {
        return {
          success: false,
          error: '進捗は0から100の間で指定してください',
        };
      }

      // 新しい学習履歴IDを生成
      const studyHistoryId = await this.studyHistoryRepository.generateId();

      // 学習履歴エンティティを作成
      const studyHistory = StudyHistory.create(
        request.deckId,
        progress,
        studyHistoryId,
      );

      // 学習履歴を保存
      await this.studyHistoryRepository.save(studyHistory);

      return {
        success: true,
        studyHistory,
      };
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : '学習履歴の作成に失敗しました',
      };
    }
  }
}
