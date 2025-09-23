import {
  CardStatusValue,
  CardStatus,
} from '../../../domain/value-object/card-status';

describe('CardStatusValue Value Object', () => {
  describe('create', () => {
    it('should create a valid card status', () => {
      const status = CardStatusValue.create(CardStatus.UNLEARNED);

      expect(status.value).toBe(CardStatus.UNLEARNED);
    });

    it('should throw error for invalid card status', () => {
      expect(() => {
        CardStatusValue.create('INVALID' as any);
      }).toThrow('Invalid card status.');
    });
  });

  describe('factory methods', () => {
    it('should create unlearned status', () => {
      const status = CardStatusValue.unlearned();

      expect(status.value).toBe(CardStatus.UNLEARNED);
    });

    it('should create mastered status', () => {
      const status = CardStatusValue.mastered();

      expect(status.value).toBe(CardStatus.MASTERED);
    });

    it('should create struggling status', () => {
      const status = CardStatusValue.struggling();

      expect(status.value).toBe(CardStatus.STRUGGLING);
    });
  });

  describe('status checks', () => {
    it('should check if status is unlearned', () => {
      const unlearnedStatus = CardStatusValue.unlearned();
      const masteredStatus = CardStatusValue.mastered();

      expect(unlearnedStatus.isUnlearned()).toBe(true);
      expect(masteredStatus.isUnlearned()).toBe(false);
    });

    it('should check if status is mastered', () => {
      const unlearnedStatus = CardStatusValue.unlearned();
      const masteredStatus = CardStatusValue.mastered();

      expect(unlearnedStatus.isMastered()).toBe(false);
      expect(masteredStatus.isMastered()).toBe(true);
    });

    it('should check if status is struggling', () => {
      const unlearnedStatus = CardStatusValue.unlearned();
      const strugglingStatus = CardStatusValue.struggling();

      expect(unlearnedStatus.isStruggling()).toBe(false);
      expect(strugglingStatus.isStruggling()).toBe(true);
    });
  });

  describe('equals', () => {
    it('should return true for equal statuses', () => {
      const status1 = CardStatusValue.mastered();
      const status2 = CardStatusValue.mastered();

      expect(status1.equals(status2)).toBe(true);
    });

    it('should return false for different statuses', () => {
      const status1 = CardStatusValue.unlearned();
      const status2 = CardStatusValue.mastered();

      expect(status1.equals(status2)).toBe(false);
    });
  });

  describe('toString', () => {
    it('should return status as string', () => {
      const status = CardStatusValue.struggling();

      expect(status.toString()).toBe(CardStatus.STRUGGLING);
    });
  });
});
