import { IGroupRepository } from '../../../domain/repository/group';
import { Group, GroupId } from '../../../domain/entity/group';
import { UserId } from '../../../domain/entity/user';
import { prisma } from '../prisma.client';
import { nanoid } from 'nanoid';

export class GroupPrismaRepository implements IGroupRepository {
  async generateId(): Promise<GroupId> {
    return nanoid();
  }

  async findById(id: GroupId): Promise<Group | null> {
    const groupData = await prisma.group.findUnique({
      where: { id },
      include: {
        decks: true,
      },
    });

    if (!groupData) {
      return null;
    }

    return this.toDomainEntity(groupData);
  }

  async findByUserId(userId: UserId): Promise<Group[]> {
    const groupsData = await prisma.group.findMany({
      where: { userId },
      include: {
        decks: true,
      },
      orderBy: { name: 'asc' },
    });

    return groupsData.map((groupData) => this.toDomainEntity(groupData));
  }

  async findByName(name: string, userId: UserId): Promise<Group | null> {
    const groupData = await prisma.group.findFirst({
      where: {
        name,
        userId,
      },
      include: {
        decks: true,
      },
    });

    if (!groupData) {
      return null;
    }

    return this.toDomainEntity(groupData);
  }

  async save(group: Group): Promise<void> {
    const groupData = this.toPersistenceData(group);

    // deckIdsを除外したデータを作成
    const { deckIds, ...groupDataWithoutDeckIds } = groupData;

    await prisma.group.upsert({
      where: { id: group.id },
      create: {
        ...groupDataWithoutDeckIds,
        decks:
          groupData.deckIds && groupData.deckIds.length > 0
            ? {
                connect: groupData.deckIds.map((id: string) => ({ id })),
              }
            : undefined,
      },
      update: {
        name: groupData.name,
        description: groupData.description,
        decks: {
          set: (groupData.deckIds || []).map((id: string) => ({ id })),
        },
      },
    });
  }

  async delete(id: GroupId): Promise<void> {
    await prisma.group.delete({
      where: { id },
    });
  }

  private toDomainEntity(groupData: any): Group {
    return Group.fromPersistence({
      id: groupData.id,
      name: groupData.name,
      description: groupData.description,
      userId: groupData.userId,
      deckIds: groupData.decks?.map((deck: any) => deck.id) || [],
    });
  }

  private toPersistenceData(group: Group) {
    return {
      id: group.id,
      name: group.name,
      description: group.description,
      userId: group.userId,
      deckIds: group.deckIds,
    };
  }
}
