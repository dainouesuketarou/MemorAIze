import { CreateStudyHistoryUseCase } from '../../../application/study-history/create-study-history.use-case';
import { IStudyHistoryRepository } from '../../../domain/repository/study-history';
import { StudyHistory } from '../../../domain/entity/study-history';

// Mock nanoid
jest.mock('nanoid', () => ({
  nanoid: jest.fn(() => 'mocked-id'),
}));

// Mock repository
const mockStudyHistoryRepository: jest.Mocked<IStudyHistoryRepository> = {
  generateId: jest.fn(),
  findById: jest.fn(),
  findByDeckId: jest.fn(),
  findLatestByDeckId: jest.fn(),
  findByDeckIdAndDateRange: jest.fn(),
  save: jest.fn(),
  delete: jest.fn(),
  deleteByDeckId: jest.fn(),
};

describe('CreateStudyHistoryUseCase', () => {
  let createStudyHistoryUseCase: CreateStudyHistoryUseCase;

  beforeEach(() => {
    jest.clearAllMocks();
    createStudyHistoryUseCase = new CreateStudyHistoryUseCase(
      mockStudyHistoryRepository,
    );
  });

  describe('execute', () => {
    it('should successfully create study history', async () => {
      // Arrange
      mockStudyHistoryRepository.generateId.mockResolvedValue('history-123');
      mockStudyHistoryRepository.save.mockResolvedValue();

      const request = {
        deckId: 'deck-123',
        progress: 75,
      };

      // Act
      const result = await createStudyHistoryUseCase.execute(request);

      // Assert
      expect(result.success).toBe(true);
      expect(result.studyHistory).toBeInstanceOf(StudyHistory);
      expect(result.studyHistory!.deckId).toBe('deck-123');
      expect(result.studyHistory!.progress).toBe(75);
      expect(mockStudyHistoryRepository.save).toHaveBeenCalledWith(
        result.studyHistory,
      );
    });

    it('should fail when progress is negative', async () => {
      // Arrange
      const request = {
        deckId: 'deck-123',
        progress: -10,
      };

      // Act
      const result = await createStudyHistoryUseCase.execute(request);

      // Assert
      expect(result.success).toBe(false);
      expect(result.error).toBe('進捗は0から100の間で指定してください');
      expect(mockStudyHistoryRepository.save).not.toHaveBeenCalled();
    });

    it('should fail when progress is over 100', async () => {
      // Arrange
      const request = {
        deckId: 'deck-123',
        progress: 150,
      };

      // Act
      const result = await createStudyHistoryUseCase.execute(request);

      // Assert
      expect(result.success).toBe(false);
      expect(result.error).toBe('進捗は0から100の間で指定してください');
      expect(mockStudyHistoryRepository.save).not.toHaveBeenCalled();
    });

    it('should handle repository errors during save', async () => {
      // Arrange
      mockStudyHistoryRepository.generateId.mockResolvedValue('history-123');
      mockStudyHistoryRepository.save.mockRejectedValue(
        new Error('Database error'),
      );

      const request = {
        deckId: 'deck-123',
        progress: 50,
      };

      // Act
      const result = await createStudyHistoryUseCase.execute(request);

      // Assert
      expect(result.success).toBe(false);
      expect(result.error).toBe('Database error');
    });

    it('should handle unknown errors', async () => {
      // Arrange
      mockStudyHistoryRepository.generateId.mockRejectedValue('Unknown error');

      const request = {
        deckId: 'deck-123',
        progress: 50,
      };

      // Act
      const result = await createStudyHistoryUseCase.execute(request);

      // Assert
      expect(result.success).toBe(false);
      expect(result.error).toBe('学習履歴の作成に失敗しました');
    });
  });
});
