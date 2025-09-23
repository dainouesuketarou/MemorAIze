import { Group, GroupId } from '../../domain/entity/group';
import { IGroupRepository } from '../../domain/repository/group';
import { UserId } from '../../domain/entity/user';

export interface CreateGroupRequest {
  name: string;
  description?: string;
  userId: UserId;
  deckIds?: string[];
}

export interface CreateGroupResponse {
  success: boolean;
  group?: Group;
  error?: string;
}

export class CreateGroupUseCase {
  constructor(private groupRepository: IGroupRepository) {}

  async execute(request: CreateGroupRequest): Promise<CreateGroupResponse> {
    try {
      // 同じ名前のグループが既に存在するかチェック
      const existingGroup = await this.groupRepository.findByName(
        request.name,
        request.userId,
      );
      if (existingGroup) {
        return {
          success: false,
          error: '同じ名前のグループが既に存在します',
        };
      }

      // 新しいグループIDを生成
      const groupId = await this.groupRepository.generateId();

      // グループエンティティを作成
      const group = Group.create(
        {
          name: request.name,
          description: request.description || '',
          userId: request.userId,
        },
        groupId,
      );

      // デッキをグループに追加
      if (request.deckIds && request.deckIds.length > 0) {
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
            : 'グループの作成に失敗しました',
      };
    }
  }
}
