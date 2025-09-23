import { AiGenerationLimit } from '../../../domain/entity/ai-generation-limit';

// Mock nanoid
jest.mock('nanoid', () => ({
  nanoid: jest.fn(() => 'mocked-id'),
}));

describe('AiGenerationLimit Entity', () => {
  describe('create', () => {
    it('should create a new AI generation limit with default values', () => {
      const month = new Date('2024-01-01');
      const limit = AiGenerationLimit.create('user-123', month, 'limit-123');

      expect(limit.id).toBe('limit-123');
      expect(limit.userId).toBe('user-123');
      expect(limit.month).toEqual(month);
      expect(limit.count).toBe(0);
      expect(limit.createdAt).toBeInstanceOf(Date);
      expect(limit.updatedAt).toBeInstanceOf(Date);
    });
  });

  describe('fromPersistence', () => {
    it('should create AI generation limit from persistence data', () => {
      const month = new Date('2024-01-01');
      const createdAt = new Date('2024-01-01T10:00:00Z');
      const updatedAt = new Date('2024-01-02T10:00:00Z');
      const limit = AiGenerationLimit.fromPersistence({
        id: 'limit-123',
        userId: 'user-456',
        month,
        count: 5,
        createdAt,
        updatedAt,
      });

      expect(limit.id).toBe('limit-123');
      expect(limit.userId).toBe('user-456');
      expect(limit.month).toEqual(month);
      expect(limit.count).toBe(5);
      expect(limit.createdAt).toEqual(createdAt);
      expect(limit.updatedAt).toEqual(updatedAt);
    });
  });

  describe('increment', () => {
    it('should increment count', () => {
      const limit = AiGenerationLimit.create(
        'user-123',
        new Date('2024-01-01'),
        'limit-123',
      );
      const initialUpdatedAt = limit.updatedAt;

      limit.increment();
      expect(limit.count).toBe(1);
      expect(limit.updatedAt.getTime()).toBeGreaterThanOrEqual(
        initialUpdatedAt.getTime(),
      );

      limit.increment();
      expect(limit.count).toBe(2);
    });
  });

  describe('setCount', () => {
    it('should set count', () => {
      const limit = AiGenerationLimit.create(
        'user-123',
        new Date('2024-01-01'),
        'limit-123',
      );
      const initialUpdatedAt = limit.updatedAt;

      limit.setCount(10);
      expect(limit.count).toBe(10);
      expect(limit.updatedAt.getTime()).toBeGreaterThanOrEqual(
        initialUpdatedAt.getTime(),
      );

      limit.setCount(0);
      expect(limit.count).toBe(0);
    });

    it('should throw error for negative count', () => {
      const limit = AiGenerationLimit.create(
        'user-123',
        new Date('2024-01-01'),
        'limit-123',
      );

      expect(() => {
        limit.setCount(-1);
      }).toThrow('Count cannot be negative.');
    });
  });

  describe('isLimitReached', () => {
    it('should return true when limit is reached', () => {
      const limit = AiGenerationLimit.create(
        'user-123',
        new Date('2024-01-01'),
        'limit-123',
      );
      limit.setCount(10);

      expect(limit.isLimitReached(10)).toBe(true);
      expect(limit.isLimitReached(5)).toBe(true);
    });

    it('should return false when limit is not reached', () => {
      const limit = AiGenerationLimit.create(
        'user-123',
        new Date('2024-01-01'),
        'limit-123',
      );
      limit.setCount(5);

      expect(limit.isLimitReached(10)).toBe(false);
      expect(limit.isLimitReached(6)).toBe(false);
    });
  });

  describe('getMonthStart', () => {
    it('should return month start date', () => {
      const month = new Date('2024-03-15'); // March 15, 2024
      const limit = AiGenerationLimit.create('user-123', month, 'limit-123');

      const monthStart = limit.getMonthStart();
      expect(monthStart.getFullYear()).toBe(2024);
      expect(monthStart.getMonth()).toBe(2); // March is month 2 (0-indexed)
      expect(monthStart.getDate()).toBe(1);
      expect(monthStart.getHours()).toBe(0);
      expect(monthStart.getMinutes()).toBe(0);
      expect(monthStart.getSeconds()).toBe(0);
    });
  });

  describe('getMonthEnd', () => {
    it('should return month end date', () => {
      const month = new Date('2024-03-15'); // March 15, 2024
      const limit = AiGenerationLimit.create('user-123', month, 'limit-123');

      const monthEnd = limit.getMonthEnd();
      expect(monthEnd.getFullYear()).toBe(2024);
      expect(monthEnd.getMonth()).toBe(2); // March is month 2 (0-indexed)
      expect(monthEnd.getDate()).toBe(31); // March has 31 days
      expect(monthEnd.getHours()).toBe(0);
      expect(monthEnd.getMinutes()).toBe(0);
      expect(monthEnd.getSeconds()).toBe(0);
    });

    it('should handle February in leap year', () => {
      const month = new Date('2024-02-15'); // February 15, 2024 (leap year)
      const limit = AiGenerationLimit.create('user-123', month, 'limit-123');

      const monthEnd = limit.getMonthEnd();
      expect(monthEnd.getDate()).toBe(29); // February has 29 days in leap year
    });

    it('should handle February in non-leap year', () => {
      const month = new Date('2023-02-15'); // February 15, 2023 (non-leap year)
      const limit = AiGenerationLimit.create('user-123', month, 'limit-123');

      const monthEnd = limit.getMonthEnd();
      expect(monthEnd.getDate()).toBe(28); // February has 28 days in non-leap year
    });
  });
});
