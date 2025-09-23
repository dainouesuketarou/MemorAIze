import { UpdateDeckUseCase } from '../../../application/deck/update-deck.use-case';
import { IDeckRepository } from '../../../domain/repository/deck';
import { Deck } from '../../../domain/entity/deck';

// Mock repository
const mockDeckRepository: jest.Mocked<IDeckRepository> = {
  generateId: jest.fn(),
  findById: jest.fn(),
  findByUserId: jest.fn(),
  save: jest.fn(),
  delete: jest.fn(),
};

describe('UpdateDeckUseCase', () => {
  let updateDeckUseCase: UpdateDeckUseCase;

  beforeEach(() => {
    jest.clearAllMocks();
    updateDeckUseCase = new UpdateDeckUseCase(mockDeckRepository);
  });

  describe('execute', () => {
    it('should successfully update deck title', async () => {
      // Arrange
      const existingDeck = Deck.create(
        {
          userId: 'user-123',
          title: 'Old Title',
        },
        'deck-123',
      );
      existingDeck.changeDescription('Old Description');
      mockDeckRepository.findById.mockResolvedValue(existingDeck);
      mockDeckRepository.save.mockResolvedValue();

      const request = {
        deckId: 'deck-123',
        title: 'New Title',
      };

      // Act
      const result = await updateDeckUseCase.execute(request);

      // Assert
      expect(result.success).toBe(true);
      expect(result.deck).toBeInstanceOf(Deck);
      expect(result.deck!.title).toBe('New Title');
      expect(result.deck!.description).toBe('Old Description'); // 変更されていない
      expect(mockDeckRepository.save).toHaveBeenCalledWith(result.deck);
    });

    it('should successfully update deck description', async () => {
      // Arrange
      const existingDeck = Deck.create(
        {
          userId: 'user-123',
          title: 'Deck Title',
        },
        'deck-123',
      );
      existingDeck.changeDescription('Old Description');
      mockDeckRepository.findById.mockResolvedValue(existingDeck);
      mockDeckRepository.save.mockResolvedValue();

      const request = {
        deckId: 'deck-123',
        description: 'New Description',
      };

      // Act
      const result = await updateDeckUseCase.execute(request);

      // Assert
      expect(result.success).toBe(true);
      expect(result.deck).toBeInstanceOf(Deck);
      expect(result.deck!.title).toBe('Deck Title'); // 変更されていない
      expect(result.deck!.description).toBe('New Description');
      expect(mockDeckRepository.save).toHaveBeenCalledWith(result.deck);
    });

    it('should successfully update both title and description', async () => {
      // Arrange
      const existingDeck = Deck.create(
        {
          userId: 'user-123',
          title: 'Old Title',
        },
        'deck-123',
      );
      existingDeck.changeDescription('Old Description');
      mockDeckRepository.findById.mockResolvedValue(existingDeck);
      mockDeckRepository.save.mockResolvedValue();

      const request = {
        deckId: 'deck-123',
        title: 'New Title',
        description: 'New Description',
      };

      // Act
      const result = await updateDeckUseCase.execute(request);

      // Assert
      expect(result.success).toBe(true);
      expect(result.deck).toBeInstanceOf(Deck);
      expect(result.deck!.title).toBe('New Title');
      expect(result.deck!.description).toBe('New Description');
      expect(mockDeckRepository.save).toHaveBeenCalledWith(result.deck);
    });

    it('should set description to null', async () => {
      // Arrange
      const existingDeck = Deck.create(
        {
          userId: 'user-123',
          title: 'Deck Title',
        },
        'deck-123',
      );
      existingDeck.changeDescription('Existing Description');
      mockDeckRepository.findById.mockResolvedValue(existingDeck);
      mockDeckRepository.save.mockResolvedValue();

      const request = {
        deckId: 'deck-123',
        description: null,
      };

      // Act
      const result = await updateDeckUseCase.execute(request);

      // Assert
      expect(result.success).toBe(true);
      expect(result.deck!.description).toBe(null);
    });

    it('should not update when no fields are specified', async () => {
      // Arrange
      const existingDeck = Deck.create(
        {
          userId: 'user-123',
          title: 'Original Title',
        },
        'deck-123',
      );
      existingDeck.changeDescription('Original Description');
      mockDeckRepository.findById.mockResolvedValue(existingDeck);
      mockDeckRepository.save.mockResolvedValue();

      const request = {
        deckId: 'deck-123',
      };

      // Act
      const result = await updateDeckUseCase.execute(request);

      // Assert
      expect(result.success).toBe(true);
      expect(result.deck!.title).toBe('Original Title');
      expect(result.deck!.description).toBe('Original Description');
      expect(mockDeckRepository.save).toHaveBeenCalledWith(result.deck);
    });

    it('should fail when deck not found', async () => {
      // Arrange
      mockDeckRepository.findById.mockResolvedValue(null);

      const request = {
        deckId: 'non-existent',
        title: 'New Title',
      };

      // Act
      const result = await updateDeckUseCase.execute(request);

      // Assert
      expect(result.success).toBe(false);
      expect(result.error).toBe('デッキが見つかりません');
      expect(mockDeckRepository.save).not.toHaveBeenCalled();
    });

    it('should handle deck title validation error', async () => {
      // Arrange
      const existingDeck = Deck.create(
        {
          userId: 'user-123',
          title: 'Valid Title',
        },
        'deck-123',
      );
      existingDeck.changeDescription('Description');
      mockDeckRepository.findById.mockResolvedValue(existingDeck);

      const request = {
        deckId: 'deck-123',
        title: '', // 空文字列はエラーになる
      };

      // Act
      const result = await updateDeckUseCase.execute(request);

      // Assert
      expect(result.success).toBe(false);
      expect(result.error).toBe('Title cannot be empty.');
    });

    it('should handle repository errors during save', async () => {
      // Arrange
      const existingDeck = Deck.create(
        {
          userId: 'user-123',
          title: 'Title',
        },
        'deck-123',
      );
      existingDeck.changeDescription('Description');
      mockDeckRepository.findById.mockResolvedValue(existingDeck);
      mockDeckRepository.save.mockRejectedValue(new Error('Database error'));

      const request = {
        deckId: 'deck-123',
        title: 'New Title',
      };

      // Act
      const result = await updateDeckUseCase.execute(request);

      // Assert
      expect(result.success).toBe(false);
      expect(result.error).toBe('Database error');
    });

    it('should handle unknown errors', async () => {
      // Arrange
      mockDeckRepository.findById.mockRejectedValue('Unknown error');

      const request = {
        deckId: 'deck-123',
        title: 'New Title',
      };

      // Act
      const result = await updateDeckUseCase.execute(request);

      // Assert
      expect(result.success).toBe(false);
      expect(result.error).toBe('デッキの更新に失敗しました');
    });
  });
});
