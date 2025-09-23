import { GetUserSubscriptionUseCase } from '../../../application/subscription/get-user-subscription.use-case';
import { ISubscriptionRepository } from '../../../domain/repository/subscription';
import { Subscription } from '../../../domain/entity/subscription';

// Mock repository
const mockSubscriptionRepository: jest.Mocked<ISubscriptionRepository> = {
  generateId: jest.fn(),
  findById: jest.fn(),
  findByUserId: jest.fn(),
  findByStripeSubscriptionId: jest.fn(),
  save: jest.fn(),
  delete: jest.fn(),
};

describe('GetUserSubscriptionUseCase', () => {
  let getUserSubscriptionUseCase: GetUserSubscriptionUseCase;

  beforeEach(() => {
    jest.clearAllMocks();
    getUserSubscriptionUseCase = new GetUserSubscriptionUseCase(
      mockSubscriptionRepository,
    );
  });

  describe('execute', () => {
    it('should successfully get user subscription', async () => {
      // Arrange
      const subscription = Subscription.createFree('user-123', 'sub-123');
      mockSubscriptionRepository.findByUserId.mockResolvedValue(subscription);

      const request = {
        userId: 'user-123',
      };

      // Act
      const result = await getUserSubscriptionUseCase.execute(request);

      // Assert
      expect(result.success).toBe(true);
      expect(result.subscription).toBeInstanceOf(Subscription);
      expect(result.subscription!.userId).toBe('user-123');
      expect(mockSubscriptionRepository.findByUserId).toHaveBeenCalledWith(
        'user-123',
      );
    });

    it('should return undefined when subscription not found', async () => {
      // Arrange
      mockSubscriptionRepository.findByUserId.mockResolvedValue(null);

      const request = {
        userId: 'user-123',
      };

      // Act
      const result = await getUserSubscriptionUseCase.execute(request);

      // Assert
      expect(result.success).toBe(true);
      expect(result.subscription).toBeUndefined();
    });

    it('should handle repository errors', async () => {
      // Arrange
      mockSubscriptionRepository.findByUserId.mockRejectedValue(
        new Error('Database error'),
      );

      const request = {
        userId: 'user-123',
      };

      // Act
      const result = await getUserSubscriptionUseCase.execute(request);

      // Assert
      expect(result.success).toBe(false);
      expect(result.error).toBe('Database error');
    });

    it('should handle unknown errors', async () => {
      // Arrange
      mockSubscriptionRepository.findByUserId.mockRejectedValue(
        'Unknown error',
      );

      const request = {
        userId: 'user-123',
      };

      // Act
      const result = await getUserSubscriptionUseCase.execute(request);

      // Assert
      expect(result.success).toBe(false);
      expect(result.error).toBe('サブスクリプションの取得に失敗しました');
    });
  });
});
