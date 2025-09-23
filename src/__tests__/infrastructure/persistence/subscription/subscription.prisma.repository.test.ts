import { SubscriptionPrismaRepository } from '../../../../infrastructure/persistence/subscription/subscription.prisma.repository';
import { Subscription } from '../../../../domain/entity/subscription';
import { SubscriptionPlanValue } from '../../../../domain/value-object/subscription-plan';
import { SubscriptionStatusValue } from '../../../../domain/value-object/subscription-status';

// Mock Prisma
jest.mock('../../../../infrastructure/persistence/prisma.client', () => ({
  prisma: {
    subscription: {
      findUnique: jest.fn(),
      upsert: jest.fn(),
      delete: jest.fn(),
    },
  },
}));

// Mock nanoid
jest.mock('nanoid', () => ({
  nanoid: jest.fn(() => 'mocked-id'),
}));

describe('SubscriptionPrismaRepository', () => {
  let subscriptionRepository: SubscriptionPrismaRepository;
  let mockPrisma: any;

  beforeEach(() => {
    subscriptionRepository = new SubscriptionPrismaRepository();
    mockPrisma =
      require('../../../../infrastructure/persistence/prisma.client').prisma;
    jest.clearAllMocks();
  });

  describe('generateId', () => {
    it('should generate a new ID', async () => {
      const id = await subscriptionRepository.generateId();
      expect(id).toBe('mocked-id');
    });
  });

  describe('findById', () => {
    it('should find subscription by id', async () => {
      const subscriptionData = {
        id: 'sub-123',
        userId: 'user-123',
        stripeSubscriptionId: 'stripe-sub-123',
        stripePriceId: 'price-123',
        stripeCurrentPeriodEnd: new Date('2024-12-31'),
        plan: 'PRO_MONTHLY',
        status: 'ACTIVE',
        cancelAtPeriodEnd: false,
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01'),
      };
      mockPrisma.subscription.findUnique.mockResolvedValue(subscriptionData);

      const result = await subscriptionRepository.findById('sub-123');

      expect(result).toBeInstanceOf(Subscription);
      expect(result!.id).toBe('sub-123');
      expect(result!.userId).toBe('user-123');
      expect(result!.plan.value).toBe('PRO_MONTHLY');
      expect(result!.status.value).toBe('ACTIVE');
      expect(mockPrisma.subscription.findUnique).toHaveBeenCalledWith({
        where: { id: 'sub-123' },
      });
    });

    it('should return null when subscription not found', async () => {
      mockPrisma.subscription.findUnique.mockResolvedValue(null);

      const result = await subscriptionRepository.findById('non-existent');

      expect(result).toBeNull();
    });
  });

  describe('findByUserId', () => {
    it('should find subscription by user id', async () => {
      const subscriptionData = {
        id: 'sub-123',
        userId: 'user-123',
        stripeSubscriptionId: null,
        stripePriceId: null,
        stripeCurrentPeriodEnd: null,
        plan: 'FREE',
        status: 'ACTIVE',
        cancelAtPeriodEnd: false,
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01'),
      };
      mockPrisma.subscription.findUnique.mockResolvedValue(subscriptionData);

      const result = await subscriptionRepository.findByUserId('user-123');

      expect(result).toBeInstanceOf(Subscription);
      expect(result!.userId).toBe('user-123');
      expect(result!.plan.value).toBe('FREE');
      expect(mockPrisma.subscription.findUnique).toHaveBeenCalledWith({
        where: { userId: 'user-123' },
      });
    });
  });

  describe('findByStripeSubscriptionId', () => {
    it('should find subscription by Stripe subscription id', async () => {
      const subscriptionData = {
        id: 'sub-123',
        userId: 'user-123',
        stripeSubscriptionId: 'stripe-sub-123',
        stripePriceId: 'price-123',
        stripeCurrentPeriodEnd: new Date('2024-12-31'),
        plan: 'PRO_YEARLY',
        status: 'ACTIVE',
        cancelAtPeriodEnd: false,
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01'),
      };
      mockPrisma.subscription.findUnique.mockResolvedValue(subscriptionData);

      const result = await subscriptionRepository.findByStripeSubscriptionId(
        'stripe-sub-123',
      );

      expect(result).toBeInstanceOf(Subscription);
      expect(result!.stripeSubscriptionId).toBe('stripe-sub-123');
      expect(result!.plan.value).toBe('PRO_YEARLY');
      expect(mockPrisma.subscription.findUnique).toHaveBeenCalledWith({
        where: { stripeSubscriptionId: 'stripe-sub-123' },
      });
    });
  });

  describe('save', () => {
    it('should create new subscription', async () => {
      const subscription = Subscription.createFree('user-123', 'sub-123');
      subscription.activate(
        'stripe-sub-123',
        'price-123',
        new Date('2024-12-31'),
        'PRO_MONTHLY',
      );

      mockPrisma.subscription.upsert.mockResolvedValue({});

      await subscriptionRepository.save(subscription);

      expect(mockPrisma.subscription.upsert).toHaveBeenCalledWith({
        where: { id: 'sub-123' },
        create: expect.objectContaining({
          id: 'sub-123',
          userId: 'user-123',
          stripeSubscriptionId: 'stripe-sub-123',
          stripePriceId: 'price-123',
          stripeCurrentPeriodEnd: expect.any(Date),
          plan: 'PRO_MONTHLY',
          status: 'ACTIVE',
          cancelAtPeriodEnd: false,
          createdAt: expect.any(Date),
          updatedAt: expect.any(Date),
        }),
        update: expect.objectContaining({
          stripeSubscriptionId: 'stripe-sub-123',
          stripePriceId: 'price-123',
          stripeCurrentPeriodEnd: expect.any(Date),
          plan: 'PRO_MONTHLY',
          status: 'ACTIVE',
          cancelAtPeriodEnd: false,
          updatedAt: expect.any(Date),
        }),
      });
    });

    it('should update existing subscription', async () => {
      const subscription = Subscription.createFree('user-123', 'sub-123');
      subscription.cancel();

      mockPrisma.subscription.upsert.mockResolvedValue({});

      await subscriptionRepository.save(subscription);

      expect(mockPrisma.subscription.upsert).toHaveBeenCalledWith({
        where: { id: 'sub-123' },
        create: expect.any(Object),
        update: expect.objectContaining({
          plan: 'FREE',
          status: 'CANCELED',
          cancelAtPeriodEnd: false,
        }),
      });
    });
  });

  describe('delete', () => {
    it('should delete subscription', async () => {
      mockPrisma.subscription.delete.mockResolvedValue({});

      await subscriptionRepository.delete('sub-123');

      expect(mockPrisma.subscription.delete).toHaveBeenCalledWith({
        where: { id: 'sub-123' },
      });
    });
  });
});
