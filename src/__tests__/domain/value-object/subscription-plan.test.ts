import {
  SubscriptionPlanValue,
  SubscriptionPlan,
} from '../../../domain/value-object/subscription-plan';

describe('SubscriptionPlanValue Value Object', () => {
  describe('create', () => {
    it('should create a valid subscription plan', () => {
      const plan = SubscriptionPlanValue.create(SubscriptionPlan.PRO_MONTHLY);

      expect(plan.value).toBe(SubscriptionPlan.PRO_MONTHLY);
    });

    it('should throw error for invalid subscription plan', () => {
      expect(() => {
        SubscriptionPlanValue.create('INVALID' as any);
      }).toThrow('Invalid subscription plan.');
    });
  });

  describe('factory methods', () => {
    it('should create free plan', () => {
      const plan = SubscriptionPlanValue.free();

      expect(plan.value).toBe(SubscriptionPlan.FREE);
    });

    it('should create pro monthly plan', () => {
      const plan = SubscriptionPlanValue.proMonthly();

      expect(plan.value).toBe(SubscriptionPlan.PRO_MONTHLY);
    });

    it('should create pro yearly plan', () => {
      const plan = SubscriptionPlanValue.proYearly();

      expect(plan.value).toBe(SubscriptionPlan.PRO_YEARLY);
    });
  });

  describe('plan checks', () => {
    it('should check if plan is free', () => {
      const freePlan = SubscriptionPlanValue.free();
      const proPlan = SubscriptionPlanValue.proMonthly();

      expect(freePlan.isFree()).toBe(true);
      expect(proPlan.isFree()).toBe(false);
    });

    it('should check if plan is pro', () => {
      const freePlan = SubscriptionPlanValue.free();
      const proMonthlyPlan = SubscriptionPlanValue.proMonthly();
      const proYearlyPlan = SubscriptionPlanValue.proYearly();

      expect(freePlan.isPro()).toBe(false);
      expect(proMonthlyPlan.isPro()).toBe(true);
      expect(proYearlyPlan.isPro()).toBe(true);
    });

    it('should check if plan is monthly', () => {
      const freePlan = SubscriptionPlanValue.free();
      const proMonthlyPlan = SubscriptionPlanValue.proMonthly();
      const proYearlyPlan = SubscriptionPlanValue.proYearly();

      expect(freePlan.isMonthly()).toBe(false);
      expect(proMonthlyPlan.isMonthly()).toBe(true);
      expect(proYearlyPlan.isMonthly()).toBe(false);
    });

    it('should check if plan is yearly', () => {
      const freePlan = SubscriptionPlanValue.free();
      const proMonthlyPlan = SubscriptionPlanValue.proMonthly();
      const proYearlyPlan = SubscriptionPlanValue.proYearly();

      expect(freePlan.isYearly()).toBe(false);
      expect(proMonthlyPlan.isYearly()).toBe(false);
      expect(proYearlyPlan.isYearly()).toBe(true);
    });
  });

  describe('equals', () => {
    it('should return true for equal plans', () => {
      const plan1 = SubscriptionPlanValue.proMonthly();
      const plan2 = SubscriptionPlanValue.proMonthly();

      expect(plan1.equals(plan2)).toBe(true);
    });

    it('should return false for different plans', () => {
      const plan1 = SubscriptionPlanValue.free();
      const plan2 = SubscriptionPlanValue.proMonthly();

      expect(plan1.equals(plan2)).toBe(false);
    });
  });

  describe('toString', () => {
    it('should return plan as string', () => {
      const plan = SubscriptionPlanValue.proYearly();

      expect(plan.toString()).toBe(SubscriptionPlan.PRO_YEARLY);
    });
  });

  describe('getDisplayName', () => {
    it('should return Japanese display name for free plan', () => {
      const plan = SubscriptionPlanValue.free();

      expect(plan.getDisplayName()).toBe('無料プラン');
    });

    it('should return Japanese display name for pro monthly plan', () => {
      const plan = SubscriptionPlanValue.proMonthly();

      expect(plan.getDisplayName()).toBe('プロ月額プラン');
    });

    it('should return Japanese display name for pro yearly plan', () => {
      const plan = SubscriptionPlanValue.proYearly();

      expect(plan.getDisplayName()).toBe('プロ年額プラン');
    });
  });
});
