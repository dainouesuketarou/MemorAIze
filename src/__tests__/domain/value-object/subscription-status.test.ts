import {
  SubscriptionStatusValue,
  SubscriptionStatus,
} from '../../../domain/value-object/subscription-status';

describe('SubscriptionStatusValue Value Object', () => {
  describe('create', () => {
    it('should create a valid subscription status', () => {
      const status = SubscriptionStatusValue.create(SubscriptionStatus.ACTIVE);

      expect(status.value).toBe(SubscriptionStatus.ACTIVE);
    });

    it('should throw error for invalid subscription status', () => {
      expect(() => {
        SubscriptionStatusValue.create('INVALID' as any);
      }).toThrow('Invalid subscription status.');
    });
  });

  describe('factory methods', () => {
    it('should create active status', () => {
      const status = SubscriptionStatusValue.active();

      expect(status.value).toBe(SubscriptionStatus.ACTIVE);
    });

    it('should create canceled status', () => {
      const status = SubscriptionStatusValue.canceled();

      expect(status.value).toBe(SubscriptionStatus.CANCELED);
    });

    it('should create past due status', () => {
      const status = SubscriptionStatusValue.pastDue();

      expect(status.value).toBe(SubscriptionStatus.PAST_DUE);
    });

    it('should create unpaid status', () => {
      const status = SubscriptionStatusValue.unpaid();

      expect(status.value).toBe(SubscriptionStatus.UNPAID);
    });

    it('should create trialing status', () => {
      const status = SubscriptionStatusValue.trialing();

      expect(status.value).toBe(SubscriptionStatus.TRIALING);
    });
  });

  describe('status checks', () => {
    it('should check if status is active', () => {
      const activeStatus = SubscriptionStatusValue.active();
      const canceledStatus = SubscriptionStatusValue.canceled();

      expect(activeStatus.isActive()).toBe(true);
      expect(canceledStatus.isActive()).toBe(false);
    });

    it('should check if status is canceled', () => {
      const activeStatus = SubscriptionStatusValue.active();
      const canceledStatus = SubscriptionStatusValue.canceled();

      expect(activeStatus.isCanceled()).toBe(false);
      expect(canceledStatus.isCanceled()).toBe(true);
    });

    it('should check if status is past due', () => {
      const activeStatus = SubscriptionStatusValue.active();
      const pastDueStatus = SubscriptionStatusValue.pastDue();

      expect(activeStatus.isPastDue()).toBe(false);
      expect(pastDueStatus.isPastDue()).toBe(true);
    });

    it('should check if status is unpaid', () => {
      const activeStatus = SubscriptionStatusValue.active();
      const unpaidStatus = SubscriptionStatusValue.unpaid();

      expect(activeStatus.isUnpaid()).toBe(false);
      expect(unpaidStatus.isUnpaid()).toBe(true);
    });

    it('should check if status is trialing', () => {
      const activeStatus = SubscriptionStatusValue.active();
      const trialingStatus = SubscriptionStatusValue.trialing();

      expect(activeStatus.isTrialing()).toBe(false);
      expect(trialingStatus.isTrialing()).toBe(true);
    });

    it('should check if status is valid (active or trialing)', () => {
      const activeStatus = SubscriptionStatusValue.active();
      const trialingStatus = SubscriptionStatusValue.trialing();
      const canceledStatus = SubscriptionStatusValue.canceled();
      const pastDueStatus = SubscriptionStatusValue.pastDue();
      const unpaidStatus = SubscriptionStatusValue.unpaid();

      expect(activeStatus.isValid()).toBe(true);
      expect(trialingStatus.isValid()).toBe(true);
      expect(canceledStatus.isValid()).toBe(false);
      expect(pastDueStatus.isValid()).toBe(false);
      expect(unpaidStatus.isValid()).toBe(false);
    });
  });

  describe('equals', () => {
    it('should return true for equal statuses', () => {
      const status1 = SubscriptionStatusValue.active();
      const status2 = SubscriptionStatusValue.active();

      expect(status1.equals(status2)).toBe(true);
    });

    it('should return false for different statuses', () => {
      const status1 = SubscriptionStatusValue.active();
      const status2 = SubscriptionStatusValue.canceled();

      expect(status1.equals(status2)).toBe(false);
    });
  });

  describe('toString', () => {
    it('should return status as string', () => {
      const status = SubscriptionStatusValue.trialing();

      expect(status.toString()).toBe(SubscriptionStatus.TRIALING);
    });
  });

  describe('getDisplayName', () => {
    it('should return Japanese display name for active status', () => {
      const status = SubscriptionStatusValue.active();

      expect(status.getDisplayName()).toBe('アクティブ');
    });

    it('should return Japanese display name for canceled status', () => {
      const status = SubscriptionStatusValue.canceled();

      expect(status.getDisplayName()).toBe('キャンセル済み');
    });

    it('should return Japanese display name for past due status', () => {
      const status = SubscriptionStatusValue.pastDue();

      expect(status.getDisplayName()).toBe('期限切れ');
    });

    it('should return Japanese display name for unpaid status', () => {
      const status = SubscriptionStatusValue.unpaid();

      expect(status.getDisplayName()).toBe('未払い');
    });

    it('should return Japanese display name for trialing status', () => {
      const status = SubscriptionStatusValue.trialing();

      expect(status.getDisplayName()).toBe('トライアル中');
    });
  });
});
