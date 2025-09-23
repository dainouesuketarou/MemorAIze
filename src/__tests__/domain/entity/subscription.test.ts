import { Subscription } from '../../../domain/entity/subscription';
import {
  SubscriptionPlanValue,
  SubscriptionPlan,
} from '../../../domain/value-object/subscription-plan';
import {
  SubscriptionStatusValue,
  SubscriptionStatus,
} from '../../../domain/value-object/subscription-status';

// Mock nanoid
jest.mock('nanoid', () => ({
  nanoid: jest.fn(() => 'mocked-id'),
}));

describe('Subscription Entity', () => {
  describe('createFree', () => {
    it('should create a free subscription', () => {
      const subscription = Subscription.createFree('user-123', 'sub-123');

      expect(subscription.id).toBe('sub-123');
      expect(subscription.userId).toBe('user-123');
      expect(subscription.plan.value).toBe(SubscriptionPlan.FREE);
      expect(subscription.status.value).toBe(SubscriptionStatus.ACTIVE);
      expect(subscription.stripeSubscriptionId).toBeNull();
      expect(subscription.stripePriceId).toBeNull();
      expect(subscription.stripeCurrentPeriodEnd).toBeNull();
      expect(subscription.cancelAtPeriodEnd).toBe(false);
    });
  });

  describe('fromPersistence', () => {
    it('should create a subscription from persistence data', () => {
      const subscription = Subscription.fromPersistence({
        id: 'sub-123',
        userId: 'user-456',
        stripeSubscriptionId: 'sub_stripe_123',
        stripePriceId: 'price_123',
        stripeCurrentPeriodEnd: new Date('2024-12-31'),
        plan: SubscriptionPlanValue.proMonthly(),
        status: SubscriptionStatusValue.active(),
        cancelAtPeriodEnd: false,
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-02'),
      });

      expect(subscription.id).toBe('sub-123');
      expect(subscription.userId).toBe('user-456');
      expect(subscription.stripeSubscriptionId).toBe('sub_stripe_123');
      expect(subscription.stripePriceId).toBe('price_123');
      expect(subscription.plan.value).toBe(SubscriptionPlan.PRO_MONTHLY);
      expect(subscription.status.value).toBe(SubscriptionStatus.ACTIVE);
    });
  });

  describe('isActive', () => {
    it('should return true for active subscription', () => {
      const subscription = Subscription.fromPersistence({
        id: 'sub-123',
        userId: 'user-123',
        stripeSubscriptionId: null,
        stripePriceId: null,
        stripeCurrentPeriodEnd: null,
        plan: SubscriptionPlanValue.free(),
        status: SubscriptionStatusValue.active(),
        cancelAtPeriodEnd: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      expect(subscription.isActive()).toBe(true);
    });

    it('should return true for trialing subscription', () => {
      const subscription = Subscription.fromPersistence({
        id: 'sub-123',
        userId: 'user-123',
        stripeSubscriptionId: null,
        stripePriceId: null,
        stripeCurrentPeriodEnd: null,
        plan: SubscriptionPlanValue.free(),
        status: SubscriptionStatusValue.trialing(),
        cancelAtPeriodEnd: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      expect(subscription.isActive()).toBe(true);
    });

    it('should return false for canceled subscription', () => {
      const subscription = Subscription.fromPersistence({
        id: 'sub-123',
        userId: 'user-123',
        stripeSubscriptionId: null,
        stripePriceId: null,
        stripeCurrentPeriodEnd: null,
        plan: SubscriptionPlanValue.free(),
        status: SubscriptionStatusValue.canceled(),
        cancelAtPeriodEnd: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      expect(subscription.isActive()).toBe(false);
    });
  });

  describe('isProPlan', () => {
    it('should return true for pro monthly plan', () => {
      const subscription = Subscription.fromPersistence({
        id: 'sub-123',
        userId: 'user-123',
        stripeSubscriptionId: null,
        stripePriceId: null,
        stripeCurrentPeriodEnd: null,
        plan: SubscriptionPlanValue.proMonthly(),
        status: SubscriptionStatusValue.active(),
        cancelAtPeriodEnd: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      expect(subscription.isProPlan()).toBe(true);
    });

    it('should return true for pro yearly plan', () => {
      const subscription = Subscription.fromPersistence({
        id: 'sub-123',
        userId: 'user-123',
        stripeSubscriptionId: null,
        stripePriceId: null,
        stripeCurrentPeriodEnd: null,
        plan: SubscriptionPlanValue.proYearly(),
        status: SubscriptionStatusValue.active(),
        cancelAtPeriodEnd: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      expect(subscription.isProPlan()).toBe(true);
    });

    it('should return false for free plan', () => {
      const subscription = Subscription.createFree('user-123', 'sub-123');

      expect(subscription.isProPlan()).toBe(false);
    });
  });

  describe('activate', () => {
    it('should activate subscription with pro plan', () => {
      const subscription = Subscription.createFree('user-123', 'sub-123');
      const periodEnd = new Date('2024-12-31');

      subscription.activate(
        'sub_stripe_123',
        'price_123',
        periodEnd,
        SubscriptionPlan.PRO_MONTHLY,
      );

      expect(subscription.stripeSubscriptionId).toBe('sub_stripe_123');
      expect(subscription.stripePriceId).toBe('price_123');
      expect(subscription.stripeCurrentPeriodEnd).toEqual(periodEnd);
      expect(subscription.plan.value).toBe(SubscriptionPlan.PRO_MONTHLY);
      expect(subscription.status.value).toBe(SubscriptionStatus.ACTIVE);
      expect(subscription.cancelAtPeriodEnd).toBe(false);
    });
  });

  describe('cancel', () => {
    it('should cancel subscription immediately', () => {
      const subscription = Subscription.createFree('user-123', 'sub-123');

      subscription.cancel(false);

      expect(subscription.status.value).toBe(SubscriptionStatus.CANCELED);
      expect(subscription.cancelAtPeriodEnd).toBe(false);
    });

    it('should set cancel at period end', () => {
      const subscription = Subscription.fromPersistence({
        id: 'sub-123',
        userId: 'user-123',
        stripeSubscriptionId: 'sub_stripe_123',
        stripePriceId: 'price_123',
        stripeCurrentPeriodEnd: new Date('2024-12-31'),
        plan: SubscriptionPlanValue.proMonthly(),
        status: SubscriptionStatusValue.active(),
        cancelAtPeriodEnd: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      subscription.cancel(true);

      expect(subscription.cancelAtPeriodEnd).toBe(true);
      expect(subscription.status.value).toBe(SubscriptionStatus.ACTIVE);
    });
  });

  describe('changePlan', () => {
    it('should change subscription plan', () => {
      const subscription = Subscription.fromPersistence({
        id: 'sub-123',
        userId: 'user-123',
        stripeSubscriptionId: 'sub_stripe_123',
        stripePriceId: 'price_123',
        stripeCurrentPeriodEnd: new Date('2024-12-31'),
        plan: SubscriptionPlanValue.proMonthly(),
        status: SubscriptionStatusValue.active(),
        cancelAtPeriodEnd: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const newPeriodEnd = new Date('2025-12-31');
      subscription.changePlan(
        SubscriptionPlan.PRO_YEARLY,
        'price_456',
        newPeriodEnd,
      );

      expect(subscription.plan.value).toBe(SubscriptionPlan.PRO_YEARLY);
      expect(subscription.stripePriceId).toBe('price_456');
      expect(subscription.stripeCurrentPeriodEnd).toEqual(newPeriodEnd);
    });
  });

  describe('updateStatus', () => {
    it('should update subscription status', () => {
      const subscription = Subscription.createFree('user-123', 'sub-123');

      subscription.updateStatus(SubscriptionStatus.PAST_DUE);

      expect(subscription.status.value).toBe(SubscriptionStatus.PAST_DUE);
    });
  });
});
