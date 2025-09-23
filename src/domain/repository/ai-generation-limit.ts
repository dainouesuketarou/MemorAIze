import {
  AiGenerationLimit,
  AiGenerationLimitId,
} from '../entity/ai-generation-limit';
import { UserId } from '../entity/user';

export interface IAiGenerationLimitRepository {
  /**
   * 新しいIDを生成する
   */
  generateId(): Promise<AiGenerationLimitId>;

  /**
   * IDでAiGenerationLimitを検索する
   * @param id AI生成制限のID
   */
  findById(id: AiGenerationLimitId): Promise<AiGenerationLimit | null>;

  /**
   * ユーザーIDと月でAiGenerationLimitを検索する
   * @param userId ユーザーのID
   * @param month 対象月
   */
  findByUserIdAndMonth(
    userId: UserId,
    month: Date,
  ): Promise<AiGenerationLimit | null>;

  /**
   * ユーザーIDでAiGenerationLimitのリストを検索する
   * @param userId ユーザーのID
   */
  findByUserId(userId: UserId): Promise<AiGenerationLimit[]>;

  /**
   * 指定期間のAiGenerationLimitのリストを検索する
   * @param userId ユーザーのID
   * @param startMonth 開始月
   * @param endMonth 終了月
   */
  findByUserIdAndDateRange(
    userId: UserId,
    startMonth: Date,
    endMonth: Date,
  ): Promise<AiGenerationLimit[]>;

  /**
   * AiGenerationLimitを保存（新規作成または更新）する
   * @param aiGenerationLimit 保存するAiGenerationLimitエンティティ
   */
  save(aiGenerationLimit: AiGenerationLimit): Promise<void>;

  /**
   * AiGenerationLimitを削除する
   * @param id 削除するAiGenerationLimitのID
   */
  delete(id: AiGenerationLimitId): Promise<void>;
}
