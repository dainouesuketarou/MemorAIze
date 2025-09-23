import { CreateDeckUseCase } from '../../../application/deck/create-deck.use-case';
import { IDeckRepository } from '../../../domain/repository/deck';
import { Deck } from '../../../domain/entity/deck';
import { Card } from '../../../domain/entity/card';

// Mock nanoid
jest.mock('nanoid', () => ({
  nanoid: jest.fn(() => 'mocked-id'),
}));

// Mock repository
const mockDeckRepository: jest.Mocked<IDeckRepository> = {
  generateId: jest.fn(),
  findById: jest.fn(),
  findByUserId: jest.fn(),
  save: jest.fn(),
  delete: jest.fn(),
};

describe('CreateDeckUseCase', () => {
  let createDeckUseCase: CreateDeckUseCase;

  beforeEach(() => {
    jest.clearAllMocks();
    createDeckUseCase = new CreateDeckUseCase(mockDeckRepository);
  });

  describe('execute', () => {
    it('should successfully create a deck with cards', async () => {
      // Arrange
      mockDeckRepository.generateId.mockResolvedValue('deck-123');
      mockDeckRepository.save.mockResolvedValue();

      const request = {
        title: 'TypeScript Basics',
        userId: 'user-123',
        cards: [
          {
            front: 'What is TypeScript?',
            back: 'A typed superset of JavaScript',
          },
          {
            front: 'What is React?',
            back: 'A JavaScript library for building UIs',
          },
        ],
        groupIds: ['group-1'],
      };

      // Act
      const result = await createDeckUseCase.execute(request);

      // Assert
      expect(result.success).toBe(true);
      expect(result.deck).toBeInstanceOf(Deck);
      expect(result.deck!.title).toBe('TypeScript Basics');
      expect(result.deck!.userId).toBe('user-123');
      expect(result.deck!.cards).toHaveLength(2);
      expect(result.deck!.cards[0].front).toBe('What is TypeScript?');
      expect(result.deck!.cards[1].front).toBe('What is React?');
      expect(mockDeckRepository.save).toHaveBeenCalledWith(result.deck);
    });

    it('should create a deck without groupIds', async () => {
      // Arrange
      mockDeckRepository.generateId.mockResolvedValue('deck-123');
      mockDeckRepository.save.mockResolvedValue();

      const request = {
        title: 'Simple Deck',
        userId: 'user-123',
        cards: [{ front: 'Question 1', back: 'Answer 1' }],
      };

      // Act
      const result = await createDeckUseCase.execute(request);

      // Assert
      expect(result.success).toBe(true);
      expect(result.deck!.groupIds).toEqual([]);
    });

    it('should handle repository errors during save', async () => {
      // Arrange
      mockDeckRepository.generateId.mockResolvedValue('deck-123');
      mockDeckRepository.save.mockRejectedValue(new Error('Database error'));

      const request = {
        title: 'Test Deck',
        userId: 'user-123',
        cards: [{ front: 'Q1', back: 'A1' }],
      };

      // Act
      const result = await createDeckUseCase.execute(request);

      // Assert
      expect(result.success).toBe(false);
      expect(result.error).toBe('Database error');
    });

    it('should handle unknown errors', async () => {
      // Arrange
      mockDeckRepository.generateId.mockRejectedValue('Unknown error');

      const request = {
        title: 'Test Deck',
        userId: 'user-123',
        cards: [{ front: 'Q1', back: 'A1' }],
      };

      // Act
      const result = await createDeckUseCase.execute(request);

      // Assert
      expect(result.success).toBe(false);
      expect(result.error).toBe('デッキの作成に失敗しました');
    });
  });
});
