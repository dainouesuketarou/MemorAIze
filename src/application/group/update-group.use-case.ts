import { Group, GroupId } from '../../domain/entity/group';
import { IGroupRepository } from '../../domain/repository/group';
import { UserId } from '../../domain/entity/user';

export interface UpdateGroupRequest {
  groupId: GroupId;
  userId: UserId;
  name?: string;
  description?: string;
  deckIds?: string[];
}

export interface UpdateGroupResponse {
  success: boolean;
  group?: Group;
  error?: string;
}

export class UpdateGroupUseCase {
  constructor(private groupRepository: IGroupRepository) {}

  async execute(request: UpdateGroupRequest): Promise<UpdateGroupResponse> {
    try {
      // グループを取得
      const group = await this.groupRepository.findById(request.groupId);
      if (!group) {
        return {
          success: false,
          error: 'グループが見つかりません',
        };
      }

      // ユーザーがグループの所有者かチェック
      if (group.userId !== request.userId) {
        return {
          success: false,
          error: 'このグループを編集する権限がありません',
        };
      }

      // 名前が変更される場合、重複チェック
      if (request.name && request.name !== group.name) {
        const existingGroup = await this.groupRepository.findByName(
          request.name,
          request.userId,
        );
        if (existingGroup && existingGroup.id !== request.groupId) {
          return {
            success: false,
            error: '同じ名前のグループが既に存在します',
          };
        }
      }

      // グループ情報を更新
      if (request.name) {
        group.changeName(request.name);
      }
      if (request.description !== undefined) {
        group.changeDescription(request.description);
      }
      if (request.deckIds !== undefined) {
        // 既存のデッキをクリアして新しいデッキを設定
        const currentDeckIds = [...group.deckIds]; // コピーを作成
        currentDeckIds.forEach((deckId) => {
          group.removeDeck(deckId);
        });
        request.deckIds.forEach((deckId) => {
          group.addDeck(deckId);
        });
      }

      // グループを保存
      await this.groupRepository.save(group);

      return {
        success: true,
        group,
      };
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : 'グループの更新に失敗しました',
      };
    }
  }
}
