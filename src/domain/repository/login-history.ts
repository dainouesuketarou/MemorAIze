import { LoginHistory, LoginHistoryId } from '../entity/login-history';
import { UserId } from '../entity/user';

export interface ILoginHistoryRepository {
  /**
   * 新しいIDを生成する
   */
  generateId(): Promise<LoginHistoryId>;

  /**
   * IDでLoginHistoryを検索する
   * @param id ログイン履歴のID
   */
  findById(id: LoginHistoryId): Promise<LoginHistory | null>;

  /**
   * ユーザーIDでLoginHistoryのリストを検索する
   * @param userId ユーザーのID
   */
  findByUserId(userId: UserId): Promise<LoginHistory[]>;

  /**
   * ユーザーIDで最新のLoginHistoryを検索する
   * @param userId ユーザーのID
   */
  findLatestByUserId(userId: UserId): Promise<LoginHistory | null>;

  /**
   * 指定期間のLoginHistoryのリストを検索する
   * @param userId ユーザーのID
   * @param startDate 開始日
   * @param endDate 終了日
   */
  findByUserIdAndDateRange(
    userId: UserId,
    startDate: Date,
    endDate: Date,
  ): Promise<LoginHistory[]>;

  /**
   * 指定件数分の最新のLoginHistoryのリストを検索する
   * @param userId ユーザーのID
   * @param limit 取得件数
   */
  findLatestByUserIdWithLimit(
    userId: UserId,
    limit: number,
  ): Promise<LoginHistory[]>;

  /**
   * LoginHistoryを保存（新規作成または更新）する
   * @param loginHistory 保存するLoginHistoryエンティティ
   */
  save(loginHistory: LoginHistory): Promise<void>;

  /**
   * LoginHistoryを削除する
   * @param id 削除するLoginHistoryのID
   */
  delete(id: LoginHistoryId): Promise<void>;
}
