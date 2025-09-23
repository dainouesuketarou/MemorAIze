import { GroupId } from '../../domain/entity/group';
import { IGroupRepository } from '../../domain/repository/group';
import { UserId } from '../../domain/entity/user';

export interface DeleteGroupRequest {
  groupId: GroupId;
  userId: UserId;
}

export interface DeleteGroupResponse {
  success: boolean;
  error?: string;
}

export class DeleteGroupUseCase {
  constructor(private groupRepository: IGroupRepository) {}

  async execute(request: DeleteGroupRequest): Promise<DeleteGroupResponse> {
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
          error: 'このグループを削除する権限がありません',
        };
      }

      // グループを削除
      await this.groupRepository.delete(request.groupId);

      return {
        success: true,
      };
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : 'グループの削除に失敗しました',
      };
    }
  }
}
