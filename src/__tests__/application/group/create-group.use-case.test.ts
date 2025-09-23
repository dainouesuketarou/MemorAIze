import { CreateGroupUseCase } from '../../../application/group/create-group.use-case';
import { IGroupRepository } from '../../../domain/repository/group';
import { Group } from '../../../domain/entity/group';

// Mock nanoid
jest.mock('nanoid', () => ({
  nanoid: jest.fn(() => 'mocked-id'),
}));

// Mock repository
const mockGroupRepository: jest.Mocked<IGroupRepository> = {
  generateId: jest.fn(),
  findById: jest.fn(),
  findByUserId: jest.fn(),
  findByName: jest.fn(),
  save: jest.fn(),
  delete: jest.fn(),
};

describe('CreateGroupUseCase', () => {
  let createGroupUseCase: CreateGroupUseCase;

  beforeEach(() => {
    jest.clearAllMocks();
    createGroupUseCase = new CreateGroupUseCase(mockGroupRepository);
  });

  describe('execute', () => {
    it('should successfully create a group', async () => {
      // Arrange
      mockGroupRepository.generateId.mockResolvedValue('group-123');
      mockGroupRepository.findByName.mockResolvedValue(null);
      mockGroupRepository.save.mockResolvedValue();

      const request = {
        name: 'Programming',
        description: 'Programming related decks',
        userId: 'user-123',
        deckIds: ['deck-1', 'deck-2'],
      };

      // Act
      const result = await createGroupUseCase.execute(request);

      // Assert
      expect(result.success).toBe(true);
      expect(result.group).toBeInstanceOf(Group);
      expect(result.group!.name).toBe('Programming');
      expect(result.group!.userId).toBe('user-123');
      expect(result.group!.deckIds).toEqual(['deck-1', 'deck-2']);
      expect(mockGroupRepository.save).toHaveBeenCalledWith(result.group);
    });

    it('should create a group without deckIds', async () => {
      // Arrange
      mockGroupRepository.generateId.mockResolvedValue('group-123');
      mockGroupRepository.findByName.mockResolvedValue(null);
      mockGroupRepository.save.mockResolvedValue();

      const request = {
        name: 'Empty Group',
        description: 'A group with no decks',
        userId: 'user-123',
      };

      // Act
      const result = await createGroupUseCase.execute(request);

      // Assert
      expect(result.success).toBe(true);
      expect(result.group!.deckIds).toEqual([]);
    });

    it('should fail when group name already exists', async () => {
      // Arrange
      const existingGroup = Group.create(
        {
          name: 'Programming',
          description: 'Existing group',
          userId: 'user-123',
        },
        'existing-group-id',
      );
      mockGroupRepository.findByName.mockResolvedValue(existingGroup);

      const request = {
        name: 'Programming',
        description: 'New group',
        userId: 'user-123',
      };

      // Act
      const result = await createGroupUseCase.execute(request);

      // Assert
      expect(result.success).toBe(false);
      expect(result.error).toBe('同じ名前のグループが既に存在します');
      expect(mockGroupRepository.save).not.toHaveBeenCalled();
    });

    it('should handle repository errors during save', async () => {
      // Arrange
      mockGroupRepository.generateId.mockResolvedValue('group-123');
      mockGroupRepository.findByName.mockResolvedValue(null);
      mockGroupRepository.save.mockRejectedValue(new Error('Database error'));

      const request = {
        name: 'Test Group',
        userId: 'user-123',
      };

      // Act
      const result = await createGroupUseCase.execute(request);

      // Assert
      expect(result.success).toBe(false);
      expect(result.error).toBe('Database error');
    });
  });
});
