import { GetUserAiLimitUseCase } from '../../../application/ai-generation-limit/get-user-ai-limit.use-case';
import { IAiGenerationLimitRepository } from '../../../domain/repository/ai-generation-limit';
import { AiGenerationLimit } from '../../../domain/entity/ai-generation-limit';

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

describe('GetUserAiLimitUseCase', () => {
  let getUserAiLimitUseCase: GetUserAiLimitUseCase;

  beforeEach(() => {
    jest.clearAllMocks();
    getUserAiLimitUseCase = new GetUserAiLimitUseCase(
      mockAiGenerationLimitRepository,
    );
  });

  describe('execute', () => {
    it('should successfully get user AI generation limit', async () => {
      // Arrange
      const aiGenerationLimit = AiGenerationLimit.create(
        'user-123',
        new Date('2024-01-01'),
        'limit-123',
      );
      aiGenerationLimit.setCount(5);
      mockAiGenerationLimitRepository.findByUserIdAndMonth.mockResolvedValue(
        aiGenerationLimit,
      );

      const request = {
        userId: 'user-123',
        month: new Date('2024-01-01'),
      };

      // Act
      const result = await getUserAiLimitUseCase.execute(request);

      // Assert
      expect(result.success).toBe(true);
      expect(result.aiGenerationLimit).toBeInstanceOf(AiGenerationLimit);
      expect(result.aiGenerationLimit!.userId).toBe('user-123');
      expect(result.aiGenerationLimit!.count).toBe(5);
      expect(
        mockAiGenerationLimitRepository.findByUserIdAndMonth,
      ).toHaveBeenCalledWith('user-123', new Date('2024-01-01'));
    });

    it('should return undefined when AI generation limit not found', async () => {
      // Arrange
      mockAiGenerationLimitRepository.findByUserIdAndMonth.mockResolvedValue(
        null,
      );

      const request = {
        userId: 'user-123',
        month: new Date('2024-01-01'),
      };

      // Act
      const result = await getUserAiLimitUseCase.execute(request);

      // Assert
      expect(result.success).toBe(true);
      expect(result.aiGenerationLimit).toBeUndefined();
    });

    it('should use current month when month not specified', async () => {
      // Arrange
      mockAiGenerationLimitRepository.findByUserIdAndMonth.mockResolvedValue(
        null,
      );

      const request = {
        userId: 'user-123',
      };

      // Act
      const result = await getUserAiLimitUseCase.execute(request);

      // Assert
      expect(result.success).toBe(true);
      expect(
        mockAiGenerationLimitRepository.findByUserIdAndMonth,
      ).toHaveBeenCalledWith('user-123', expect.any(Date));
    });

    it('should handle repository errors', async () => {
      // Arrange
      mockAiGenerationLimitRepository.findByUserIdAndMonth.mockRejectedValue(
        new Error('Database error'),
      );

      const request = {
        userId: 'user-123',
      };

      // Act
      const result = await getUserAiLimitUseCase.execute(request);

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
      const result = await getUserAiLimitUseCase.execute(request);

      // Assert
      expect(result.success).toBe(false);
      expect(result.error).toBe('AI生成制限の取得に失敗しました');
    });
  });
});
