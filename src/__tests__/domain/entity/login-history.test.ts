import { LoginHistory } from '../../../domain/entity/login-history';

// Mock nanoid
jest.mock('nanoid', () => ({
  nanoid: jest.fn(() => 'mocked-id'),
}));

describe('LoginHistory Entity', () => {
  describe('create', () => {
    it('should create a new login history', () => {
      const loginHistory = LoginHistory.create('user-123', 'history-123');

      expect(loginHistory.id).toBe('history-123');
      expect(loginHistory.userId).toBe('user-123');
      expect(loginHistory.loginAt).toBeInstanceOf(Date);
      expect(loginHistory.createdAt).toBeInstanceOf(Date);
    });

    it('should set loginAt and createdAt to current time', () => {
      const beforeCreate = new Date();
      const loginHistory = LoginHistory.create('user-123', 'history-123');
      const afterCreate = new Date();

      expect(loginHistory.loginAt.getTime()).toBeGreaterThanOrEqual(
        beforeCreate.getTime(),
      );
      expect(loginHistory.loginAt.getTime()).toBeLessThanOrEqual(
        afterCreate.getTime(),
      );
      expect(loginHistory.createdAt.getTime()).toBeGreaterThanOrEqual(
        beforeCreate.getTime(),
      );
      expect(loginHistory.createdAt.getTime()).toBeLessThanOrEqual(
        afterCreate.getTime(),
      );
    });
  });

  describe('fromPersistence', () => {
    it('should create login history from persistence data', () => {
      const loginAt = new Date('2024-01-01T10:00:00Z');
      const createdAt = new Date('2024-01-01T10:00:00Z');
      const loginHistory = LoginHistory.fromPersistence({
        id: 'history-123',
        userId: 'user-456',
        loginAt,
        createdAt,
      });

      expect(loginHistory.id).toBe('history-123');
      expect(loginHistory.userId).toBe('user-456');
      expect(loginHistory.loginAt).toEqual(loginAt);
      expect(loginHistory.createdAt).toEqual(createdAt);
    });
  });

  describe('getter properties', () => {
    it('should return correct values', () => {
      const loginAt = new Date('2024-01-01T10:00:00Z');
      const createdAt = new Date('2024-01-01T10:00:00Z');
      const loginHistory = LoginHistory.fromPersistence({
        id: 'history-123',
        userId: 'user-456',
        loginAt,
        createdAt,
      });

      expect(loginHistory.id).toBe('history-123');
      expect(loginHistory.userId).toBe('user-456');
      expect(loginHistory.loginAt).toEqual(loginAt);
      expect(loginHistory.createdAt).toEqual(createdAt);
    });
  });
});
