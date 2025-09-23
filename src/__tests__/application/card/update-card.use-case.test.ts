import { UpdateCardUseCase } from '../../../application/card/update-card.use-case';
import { ICardRepository } from '../../../domain/repository/card';
import { Card } from '../../../domain/entity/card';
import { CardStatusValue } from '../../../domain/value-object/card-status';

// Mock repository
const mockCardRepository: jest.Mocked<ICardRepository> = {
  generateId: jest.fn(),
  findById: jest.fn(),
  findByDeckId: jest.fn(),
  save: jest.fn(),
  delete: jest.fn(),
  updateOrder: jest.fn(),
};

describe('UpdateCardUseCase', () => {
  let updateCardUseCase: UpdateCardUseCase;

  beforeEach(() => {
    jest.clearAllMocks();
    updateCardUseCase = new UpdateCardUseCase(mockCardRepository);
  });

  describe('execute', () => {
    it('should successfully update card content', async () => {
      // Arrange
      const existingCard = Card.create(
        {
          front: 'Old Question',
          back: 'Old Answer',
          order: 0,
        },
        'card-123',
      );
      mockCardRepository.findById.mockResolvedValue(existingCard);
      mockCardRepository.save.mockResolvedValue();

      const request = {
        cardId: 'card-123',
        deckId: 'deck-123',
        front: 'New Question',
        back: 'New Answer',
      };

      // Act
      const result = await updateCardUseCase.execute(request);

      // Assert
      expect(result.success).toBe(true);
      expect(result.card).toBeInstanceOf(Card);
      expect(result.card!.front).toBe('New Question');
      expect(result.card!.back).toBe('New Answer');
      expect(mockCardRepository.save).toHaveBeenCalledWith(
        result.card,
        'deck-123',
      );
    });

    it('should successfully update card status', async () => {
      // Arrange
      const existingCard = Card.create(
        {
          front: 'Question',
          back: 'Answer',
          order: 0,
        },
        'card-123',
      );
      mockCardRepository.findById.mockResolvedValue(existingCard);
      mockCardRepository.save.mockResolvedValue();

      const request = {
        cardId: 'card-123',
        deckId: 'deck-123',
        status: CardStatusValue.mastered(),
      };

      // Act
      const result = await updateCardUseCase.execute(request);

      // Assert
      expect(result.success).toBe(true);
      expect(result.card!.status.value).toBe('MASTERED');
    });

    it('should successfully toggle favorite status', async () => {
      // Arrange
      const existingCard = Card.create(
        {
          front: 'Question',
          back: 'Answer',
          order: 0,
        },
        'card-123',
      );
      mockCardRepository.findById.mockResolvedValue(existingCard);
      mockCardRepository.save.mockResolvedValue();

      const request = {
        cardId: 'card-123',
        deckId: 'deck-123',
        isFavorite: true,
      };

      // Act
      const result = await updateCardUseCase.execute(request);

      // Assert
      expect(result.success).toBe(true);
      expect(result.card!.isFavorite).toBe(true);
    });

    it('should successfully update card order', async () => {
      // Arrange
      const existingCard = Card.create(
        {
          front: 'Question',
          back: 'Answer',
          order: 0,
        },
        'card-123',
      );
      mockCardRepository.findById.mockResolvedValue(existingCard);
      mockCardRepository.save.mockResolvedValue();

      const request = {
        cardId: 'card-123',
        deckId: 'deck-123',
        order: 5,
      };

      // Act
      const result = await updateCardUseCase.execute(request);

      // Assert
      expect(result.success).toBe(true);
      expect(result.card!.order).toBe(5);
    });

    it('should update multiple fields at once', async () => {
      // Arrange
      const existingCard = Card.create(
        {
          front: 'Old Question',
          back: 'Old Answer',
          order: 0,
        },
        'card-123',
      );
      mockCardRepository.findById.mockResolvedValue(existingCard);
      mockCardRepository.save.mockResolvedValue();

      const request = {
        cardId: 'card-123',
        deckId: 'deck-123',
        front: 'New Question',
        status: CardStatusValue.struggling(),
        isFavorite: true,
        order: 3,
      };

      // Act
      const result = await updateCardUseCase.execute(request);

      // Assert
      expect(result.success).toBe(true);
      expect(result.card!.front).toBe('New Question');
      expect(result.card!.status.value).toBe('STRUGGLING');
      expect(result.card!.isFavorite).toBe(true);
      expect(result.card!.order).toBe(3);
    });

    it('should not toggle favorite when already in desired state', async () => {
      // Arrange
      const existingCard = Card.create(
        {
          front: 'Question',
          back: 'Answer',
          order: 0,
        },
        'card-123',
      );
      // 既にfavoriteがtrueの場合
      existingCard.toggleFavorite();
      mockCardRepository.findById.mockResolvedValue(existingCard);
      mockCardRepository.save.mockResolvedValue();

      const request = {
        cardId: 'card-123',
        deckId: 'deck-123',
        isFavorite: true, // 既にtrueなので変更なし
      };

      // Act
      const result = await updateCardUseCase.execute(request);

      // Assert
      expect(result.success).toBe(true);
      expect(result.card!.isFavorite).toBe(true);
    });

    it('should fail when card not found', async () => {
      // Arrange
      mockCardRepository.findById.mockResolvedValue(null);

      const request = {
        cardId: 'non-existent',
        deckId: 'deck-123',
        front: 'New Question',
      };

      // Act
      const result = await updateCardUseCase.execute(request);

      // Assert
      expect(result.success).toBe(false);
      expect(result.error).toBe('カードが見つかりません');
      expect(mockCardRepository.save).not.toHaveBeenCalled();
    });

    it('should handle repository errors during save', async () => {
      // Arrange
      const existingCard = Card.create(
        {
          front: 'Question',
          back: 'Answer',
          order: 0,
        },
        'card-123',
      );
      mockCardRepository.findById.mockResolvedValue(existingCard);
      mockCardRepository.save.mockRejectedValue(new Error('Database error'));

      const request = {
        cardId: 'card-123',
        deckId: 'deck-123',
        front: 'New Question',
      };

      // Act
      const result = await updateCardUseCase.execute(request);

      // Assert
      expect(result.success).toBe(false);
      expect(result.error).toBe('Database error');
    });

    it('should handle unknown errors', async () => {
      // Arrange
      mockCardRepository.findById.mockRejectedValue('Unknown error');

      const request = {
        cardId: 'card-123',
        deckId: 'deck-123',
        front: 'New Question',
      };

      // Act
      const result = await updateCardUseCase.execute(request);

      // Assert
      expect(result.success).toBe(false);
      expect(result.error).toBe('カードの更新に失敗しました');
    });

    it('should update only specified fields', async () => {
      // Arrange
      const existingCard = Card.create(
        {
          front: 'Original Question',
          back: 'Original Answer',
          order: 0,
        },
        'card-123',
      );
      existingCard.changeStatus(CardStatusValue.unlearned());
      existingCard.toggleFavorite(); // trueにする
      mockCardRepository.findById.mockResolvedValue(existingCard);
      mockCardRepository.save.mockResolvedValue();

      const request = {
        cardId: 'card-123',
        deckId: 'deck-123',
        front: 'Updated Question Only',
      };

      // Act
      const result = await updateCardUseCase.execute(request);

      // Assert
      expect(result.success).toBe(true);
      expect(result.card!.front).toBe('Updated Question Only');
      expect(result.card!.back).toBe('Original Answer'); // 変更されていない
      expect(result.card!.status.value).toBe('UNLEARNED'); // 変更されていない
      expect(result.card!.isFavorite).toBe(true); // 変更されていない
    });
  });
});
