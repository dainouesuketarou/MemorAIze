import { User, UserId, UserEmail } from "../entity/user";

export interface IUserRepository {
  /**
   * 新しいIDを生成する
   */
  generateId(): Promise<UserId>;

  /**
   * IDでUserを検索する
   * @param id ユーザーのID
   */
  findById(id: UserId): Promise<User | null>;

  /**
   * EmailでUserを検索する
   * @param email ユーザーのEmail
   */
  findByEmail(email: UserEmail): Promise<User | null>;

  /**
   * Userを保存（新規作成または更新）する
   * @param user 保存するUserエンティティ
   */
  save(user: User): Promise<void>;

  /**
   * Userを削除する
   * @param id 削除するUserのID
   */
  delete(id: UserId): Promise<void>;
}
