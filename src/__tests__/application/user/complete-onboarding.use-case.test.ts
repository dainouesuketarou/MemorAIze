import { CompleteOnboardingUseCase } from '../../../application/user/complete-onboarding.use-case';
import { IUserRepository } from '../../../domain/repository/user';
import { User } from '../../../domain/entity/user';
import { StudyPurposeType } from '../../../domain/value-object/study-purpose';

// Mock repository
const mockUserRepository: jest.Mocked<IUserRepository> = {
  generateId: jest.fn(),
  findById: jest.fn(),
  findByEmail: jest.fn(),
  save: jest.fn(),
  delete: jest.fn(),
};

describe('CompleteOnboardingUseCase', () => {
  let completeOnboardingUseCase: CompleteOnboardingUseCase;

  beforeEach(() => {
    jest.clearAllMocks();
    completeOnboardingUseCase = new CompleteOnboardingUseCase(
      mockUserRepository,
    );
  });

  describe('execute', () => {
    it('should successfully complete onboarding', async () => {
      // Arrange
      const existingUser = User.create(
        {
          email: 'test@example.com',
          name: 'Test User',
          image: null,
        },
        'user-123',
      );
      mockUserRepository.findById.mockResolvedValue(existingUser);
      mockUserRepository.save.mockResolvedValue();

      const request = {
        userId: 'user-123',
        username: 'New Username',
        purposes: ['QUALIFICATION', 'LANGUAGE_LEARNING'] as StudyPurposeType[],
      };

      // Act
      const result = await completeOnboardingUseCase.execute(request);

      // Assert
      expect(result.success).toBe(true);
      expect(result.user).toBeInstanceOf(User);
      expect(result.user!.name).toBe('New Username');
      expect(result.user!.studyPurposes.values).toEqual([
        'QUALIFICATION',
        'LANGUAGE_LEARNING',
      ]);
      expect(result.user!.isOnboarded).toBe(true);
      expect(mockUserRepository.save).toHaveBeenCalledWith(result.user);
    });

    it('should fail when user not found', async () => {
      // Arrange
      mockUserRepository.findById.mockResolvedValue(null);

      const request = {
        userId: 'non-existent',
        username: 'Test User',
        purposes: ['QUALIFICATION'] as StudyPurposeType[],
      };

      // Act
      const result = await completeOnboardingUseCase.execute(request);

      // Assert
      expect(result.success).toBe(false);
      expect(result.error).toBe('ユーザーが見つかりません');
      expect(mockUserRepository.save).not.toHaveBeenCalled();
    });

    it('should handle repository errors during save', async () => {
      // Arrange
      const existingUser = User.create(
        {
          email: 'test@example.com',
          name: 'Test User',
          image: null,
        },
        'user-123',
      );
      mockUserRepository.findById.mockResolvedValue(existingUser);
      mockUserRepository.save.mockRejectedValue(new Error('Database error'));

      const request = {
        userId: 'user-123',
        username: 'Test User',
        purposes: ['QUALIFICATION'] as StudyPurposeType[],
      };

      // Act
      const result = await completeOnboardingUseCase.execute(request);

      // Assert
      expect(result.success).toBe(false);
      expect(result.error).toBe('Database error');
    });

    it('should handle unknown errors', async () => {
      // Arrange
      mockUserRepository.findById.mockRejectedValue('Unknown error');

      const request = {
        userId: 'user-123',
        username: 'Test User',
        purposes: ['QUALIFICATION'] as StudyPurposeType[],
      };

      // Act
      const result = await completeOnboardingUseCase.execute(request);

      // Assert
      expect(result.success).toBe(false);
      expect(result.error).toBe('オンボーディングの保存に失敗しました');
    });
  });
});
