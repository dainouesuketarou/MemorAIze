import { Group, GroupId } from '../entity/group';
import { UserId } from '../entity/user';

export interface IGroupRepository {
  /**
   * 新しいIDを生成する
   */
  generateId(): Promise<GroupId>;

  /**
   * IDでGroupを検索する
   * @param id グループのID
   */
  findById(id: GroupId): Promise<Group | null>;

  /**
   * ユーザーIDでGroupのリストを検索する
   * @param userId ユーザーのID
   */
  findByUserId(userId: UserId): Promise<Group[]>;

  /**
   * グループ名でGroupを検索する
   * @param name グループ名
   * @param userId ユーザーのID
   */
  findByName(name: string, userId: UserId): Promise<Group | null>;

  /**
   * Groupを保存（新規作成または更新）する
   * @param group 保存するGroupエンティティ
   */
  save(group: Group): Promise<void>;

  /**
   * Groupを削除する
   * @param id 削除するGroupのID
   */
  delete(id: GroupId): Promise<void>;
}
