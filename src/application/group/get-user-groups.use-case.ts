import { Group } from '../../domain/entity/group';
import { IGroupRepository } from '../../domain/repository/group';
import { UserId } from '../../domain/entity/user';

export interface GetUserGroupsRequest {
  userId: UserId;
}

export interface GetUserGroupsResponse {
  success: boolean;
  groups?: Group[];
  error?: string;
}

export class GetUserGroupsUseCase {
  constructor(private groupRepository: IGroupRepository) {}

  async execute(request: GetUserGroupsRequest): Promise<GetUserGroupsResponse> {
    try {
      const groups = await this.groupRepository.findByUserId(request.userId);

      return {
        success: true,
        groups,
      };
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : 'グループの取得に失敗しました',
      };
    }
  }
}
