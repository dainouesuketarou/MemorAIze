import { GroupPrismaRepository } from '../../../../infrastructure/persistence/group/group.prisma.repository';
import { Group } from '../../../../domain/entity/group';

// Mock Prisma
jest.mock('../../../../infrastructure/persistence/prisma.client', () => ({
  prisma: {
    group: {
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      findMany: jest.fn(),
      upsert: jest.fn(),
      delete: jest.fn(),
    },
  },
}));

// Mock nanoid
jest.mock('nanoid', () => ({
  nanoid: jest.fn(() => 'mocked-id'),
}));

describe('GroupPrismaRepository', () => {
  let groupRepository: GroupPrismaRepository;
  let mockPrisma: any;

  beforeEach(() => {
    groupRepository = new GroupPrismaRepository();
    mockPrisma =
      require('../../../../infrastructure/persistence/prisma.client').prisma;
    jest.clearAllMocks();
  });

  describe('generateId', () => {
    it('should generate a new ID', async () => {
      const id = await groupRepository.generateId();
      expect(id).toBe('mocked-id');
    });
  });

  describe('findById', () => {
    it('should find group by id', async () => {
      const groupData = {
        id: 'group-123',
        name: 'Programming',
        description: 'Programming related decks',
        userId: 'user-123',
        decks: [{ id: 'deck-1' }, { id: 'deck-2' }],
      };
      mockPrisma.group.findUnique.mockResolvedValue(groupData);

      const result = await groupRepository.findById('group-123');

      expect(result).toBeInstanceOf(Group);
      expect(result!.id).toBe('group-123');
      expect(result!.name).toBe('Programming');
      expect(result!.deckIds).toEqual(['deck-1', 'deck-2']);
      expect(mockPrisma.group.findUnique).toHaveBeenCalledWith({
        where: { id: 'group-123' },
        include: {
          decks: true,
        },
      });
    });

    it('should return null when group not found', async () => {
      mockPrisma.group.findUnique.mockResolvedValue(null);

      const result = await groupRepository.findById('non-existent');

      expect(result).toBeNull();
    });
  });

  describe('findByUserId', () => {
    it('should find groups by user id', async () => {
      const groupsData = [
        {
          id: 'group-1',
          name: 'Group 1',
          description: 'First group',
          userId: 'user-123',
          decks: [],
        },
        {
          id: 'group-2',
          name: 'Group 2',
          description: 'Second group',
          userId: 'user-123',
          decks: [{ id: 'deck-1' }],
        },
      ];
      mockPrisma.group.findMany.mockResolvedValue(groupsData);

      const result = await groupRepository.findByUserId('user-123');

      expect(result).toHaveLength(2);
      expect(result[0]).toBeInstanceOf(Group);
      expect(result[1]).toBeInstanceOf(Group);
      expect(mockPrisma.group.findMany).toHaveBeenCalledWith({
        where: { userId: 'user-123' },
        include: {
          decks: true,
        },
        orderBy: { name: 'asc' },
      });
    });
  });

  describe('findByName', () => {
    it('should find group by name and user id', async () => {
      const groupData = {
        id: 'group-123',
        name: 'Programming',
        description: 'Programming related decks',
        userId: 'user-123',
        decks: [],
      };
      mockPrisma.group.findFirst.mockResolvedValue(groupData);

      const result = await groupRepository.findByName(
        'Programming',
        'user-123',
      );

      expect(result).toBeInstanceOf(Group);
      expect(result!.name).toBe('Programming');
      expect(mockPrisma.group.findFirst).toHaveBeenCalledWith({
        where: {
          name: 'Programming',
          userId: 'user-123',
        },
        include: {
          decks: true,
        },
      });
    });

    it('should return null when group not found', async () => {
      mockPrisma.group.findFirst.mockResolvedValue(null);

      const result = await groupRepository.findByName(
        'Non-existent',
        'user-123',
      );

      expect(result).toBeNull();
    });
  });

  describe('save', () => {
    it('should create new group', async () => {
      const group = Group.create(
        {
          name: 'New Group',
          description: 'A new group',
          userId: 'user-123',
        },
        'group-123',
      );

      mockPrisma.group.upsert.mockResolvedValue({});

      await groupRepository.save(group);

      expect(mockPrisma.group.upsert).toHaveBeenCalledWith({
        where: { id: 'group-123' },
        create: expect.objectContaining({
          id: 'group-123',
          name: 'New Group',
          description: 'A new group',
          userId: 'user-123',
          decks: undefined,
        }),
        update: expect.objectContaining({
          name: 'New Group',
          description: 'A new group',
          decks: {
            set: [],
          },
        }),
      });
    });

    it('should update existing group with decks', async () => {
      const group = Group.create(
        {
          name: 'Updated Group',
          description: 'Updated description',
          userId: 'user-123',
        },
        'group-123',
      );
      group.addDeck('deck-1');
      group.addDeck('deck-2');

      mockPrisma.group.upsert.mockResolvedValue({});

      await groupRepository.save(group);

      expect(mockPrisma.group.upsert).toHaveBeenCalledWith({
        where: { id: 'group-123' },
        create: expect.objectContaining({
          decks: {
            connect: [{ id: 'deck-1' }, { id: 'deck-2' }],
          },
        }),
        update: expect.objectContaining({
          decks: {
            set: [{ id: 'deck-1' }, { id: 'deck-2' }],
          },
        }),
      });
    });
  });

  describe('delete', () => {
    it('should delete group', async () => {
      mockPrisma.group.delete.mockResolvedValue({});

      await groupRepository.delete('group-123');

      expect(mockPrisma.group.delete).toHaveBeenCalledWith({
        where: { id: 'group-123' },
      });
    });
  });
});
