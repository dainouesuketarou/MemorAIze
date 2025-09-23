import { IncrementAiLimitUseCase } from '../../../application/ai-generation-limit/increment-ai-limit.use-case';
import { IAiGenerationLimitRepository } from '../../../domain/repository/ai-generation-limit';
import { AiGenerationLimit } from '../../../domain/entity/ai-generation-limit';

// Mock nanoid
jest.mock('nanoid', () => ({
  nanoid: jest.fn(() => 'mocked-id'),
}));

// Mock repository
const mockAiGenerationLimitRepository: jest.Mocked<IAiGenerationLimitRepository> =
  {
    generateId: jest.fn(),
    findById: jest.fn(),
    findByUserIdAndMonth: jest.fn(),
    findByUserId: jest.fn(),
    findByUserIdAndDateRange: jest.fn(),
    save: jest.fn(),
    delete: jest.fn(),
  };

describe('IncrementAiLimitUseCase', () => {
  let incrementAiLimitUseCase: IncrementAiLimitUseCase;

  beforeEach(() => {
    jest.clearAllMocks();
    incrementAiLimitUseCase = new IncrementAiLimitUseCase(
      mockAiGenerationLimitRepository,
    );
  });

  describe('execute', () => {
    it('should increment existing AI generation limit', async () => {
      // Arrange
      const existingLimit = AiGenerationLimit.create(
        'user-123',
        new Date('2024-01-01'),
        'limit-123',
      );
      existingLimit.setCount(5);
      mockAiGenerationLimitRepository.findByUserIdAndMonth.mockResolvedValue(
        existingLimit,
      );
      mockAiGenerationLimitRepository.save.mockResolvedValue();

      const request = {
        userId: 'user-123',
        month: new Date('2024-01-01'),
      };

      // Act
      const result = await incrementAiLimitUseCase.execute(request);

      // Assert
      expect(result.success).toBe(true);
      expect(result.aiGenerationLimit).toBeInstanceOf(AiGenerationLimit);
      expect(result.aiGenerationLimit!.count).toBe(6);
      expect(mockAiGenerationLimitRepository.save).toHaveBeenCalledWith(
        result.aiGenerationLimit,
      );
    });

    it('should create new AI generation limit when not exists', async () => {
      // Arrange
      mockAiGenerationLimitRepository.findByUserIdAndMonth.mockResolvedValue(
        null,
      );
      mockAiGenerationLimitRepository.generateId.mockResolvedValue('limit-123');
      mockAiGenerationLimitRepository.save.mockResolvedValue();

      const request = {
        userId: 'user-123',
        month: new Date('2024-01-01'),
      };

      // Act
      const result = await incrementAiLimitUseCase.execute(request);

      // Assert
      expect(result.success).toBe(true);
      expect(result.aiGenerationLimit).toBeInstanceOf(AiGenerationLimit);
      expect(result.aiGenerationLimit!.count).toBe(1);
      expect(result.aiGenerationLimit!.userId).toBe('user-123');
      expect(mockAiGenerationLimitRepository.save).toHaveBeenCalledWith(
        result.aiGenerationLimit,
      );
    });

    it('should use current month when month not specified', async () => {
      // Arrange
      mockAiGenerationLimitRepository.findByUserIdAndMonth.mockResolvedValue(
        null,
      );
      mockAiGenerationLimitRepository.generateId.mockResolvedValue('limit-123');
      mockAiGenerationLimitRepository.save.mockResolvedValue();

      const request = {
        userId: 'user-123',
      };

      // Act
      const result = await incrementAiLimitUseCase.execute(request);

      // Assert
      expect(result.success).toBe(true);
      expect(
        mockAiGenerationLimitRepository.findByUserIdAndMonth,
      ).toHaveBeenCalledWith('user-123', expect.any(Date));
    });

    it('should handle repository errors during save', async () => {
      // Arrange
      const existingLimit = AiGenerationLimit.create(
        'user-123',
        new Date('2024-01-01'),
        'limit-123',
      );
      mockAiGenerationLimitRepository.findByUserIdAndMonth.mockResolvedValue(
        existingLimit,
      );
      mockAiGenerationLimitRepository.save.mockRejectedValue(
        new Error('Database error'),
      );

      const request = {
        userId: 'user-123',
      };

      // Act
      const result = await incrementAiLimitUseCase.execute(request);

      // Assert
      expect(result.success).toBe(false);
      expect(result.error).toBe('Database error');
    });

    it('should handle unknown errors', async () => {
      // Arrange
      mockAiGenerationLimitRepository.findByUserIdAndMonth.mockRejectedValue(
        'Unknown error',
      );

      const request = {
        userId: 'user-123',
      };

      // Act
      const result = await incrementAiLimitUseCase.execute(request);

      // Assert
      expect(result.success).toBe(false);
      expect(result.error).toBe('AI生成制限のインクリメントに失敗しました');
    });
  });
});
