import { LoginHistoryPrismaRepository } from '../../../../infrastructure/persistence/login-history/login-history.prisma.repository';
import { LoginHistory } from '../../../../domain/entity/login-history';

// Mock Prisma
jest.mock('../../../../infrastructure/persistence/prisma.client', () => ({
  prisma: {
    loginHistory: {
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      findMany: jest.fn(),
      create: jest.fn(),
      delete: jest.fn(),
    },
  },
}));

// Mock nanoid
jest.mock('nanoid', () => ({
  nanoid: jest.fn(() => 'mocked-id'),
}));

describe('LoginHistoryPrismaRepository', () => {
  let loginHistoryRepository: LoginHistoryPrismaRepository;
  let mockPrisma: any;

  beforeEach(() => {
    loginHistoryRepository = new LoginHistoryPrismaRepository();
    mockPrisma =
      require('../../../../infrastructure/persistence/prisma.client').prisma;
    jest.clearAllMocks();
  });

  describe('generateId', () => {
    it('should generate a new ID', async () => {
      const id = await loginHistoryRepository.generateId();
      expect(id).toBe('mocked-id');
    });
  });

  describe('findById', () => {
    it('should find login history by id', async () => {
      const loginHistoryData = {
        id: 'history-123',
        userId: 'user-123',
        loginAt: new Date('2024-01-01T10:00:00Z'),
        createdAt: new Date('2024-01-01T10:00:00Z'),
      };
      mockPrisma.loginHistory.findUnique.mockResolvedValue(loginHistoryData);

      const result = await loginHistoryRepository.findById('history-123');

      expect(result).toBeInstanceOf(LoginHistory);
      expect(result!.id).toBe('history-123');
      expect(result!.userId).toBe('user-123');
      expect(result!.loginAt).toEqual(new Date('2024-01-01T10:00:00Z'));
      expect(mockPrisma.loginHistory.findUnique).toHaveBeenCalledWith({
        where: { id: 'history-123' },
      });
    });

    it('should return null when login history not found', async () => {
      mockPrisma.loginHistory.findUnique.mockResolvedValue(null);

      const result = await loginHistoryRepository.findById('non-existent');

      expect(result).toBeNull();
    });
  });

  describe('findByUserId', () => {
    it('should find login histories by user id', async () => {
      const loginHistoriesData = [
        {
          id: 'history-1',
          userId: 'user-123',
          loginAt: new Date('2024-01-02T10:00:00Z'),
          createdAt: new Date('2024-01-02T10:00:00Z'),
        },
        {
          id: 'history-2',
          userId: 'user-123',
          loginAt: new Date('2024-01-01T10:00:00Z'),
          createdAt: new Date('2024-01-01T10:00:00Z'),
        },
      ];
      mockPrisma.loginHistory.findMany.mockResolvedValue(loginHistoriesData);

      const result = await loginHistoryRepository.findByUserId('user-123');

      expect(result).toHaveLength(2);
      expect(result[0]).toBeInstanceOf(LoginHistory);
      expect(result[1]).toBeInstanceOf(LoginHistory);
      expect(mockPrisma.loginHistory.findMany).toHaveBeenCalledWith({
        where: { userId: 'user-123' },
        orderBy: { loginAt: 'desc' },
      });
    });
  });

  describe('findLatestByUserId', () => {
    it('should find latest login history by user id', async () => {
      const loginHistoryData = {
        id: 'history-123',
        userId: 'user-123',
        loginAt: new Date('2024-01-02T10:00:00Z'),
        createdAt: new Date('2024-01-02T10:00:00Z'),
      };
      mockPrisma.loginHistory.findFirst.mockResolvedValue(loginHistoryData);

      const result = await loginHistoryRepository.findLatestByUserId(
        'user-123',
      );

      expect(result).toBeInstanceOf(LoginHistory);
      expect(result!.userId).toBe('user-123');
      expect(result!.loginAt).toEqual(new Date('2024-01-02T10:00:00Z'));
      expect(mockPrisma.loginHistory.findFirst).toHaveBeenCalledWith({
        where: { userId: 'user-123' },
        orderBy: { loginAt: 'desc' },
      });
    });

    it('should return null when no login history found', async () => {
      mockPrisma.loginHistory.findFirst.mockResolvedValue(null);

      const result = await loginHistoryRepository.findLatestByUserId(
        'user-123',
      );

      expect(result).toBeNull();
    });
  });

  describe('findByUserIdAndDateRange', () => {
    it('should find login histories by user id and date range', async () => {
      const startDate = new Date('2024-01-01');
      const endDate = new Date('2024-01-31');
      const loginHistoriesData = [
        {
          id: 'history-1',
          userId: 'user-123',
          loginAt: new Date('2024-01-15T10:00:00Z'),
          createdAt: new Date('2024-01-15T10:00:00Z'),
        },
      ];
      mockPrisma.loginHistory.findMany.mockResolvedValue(loginHistoriesData);

      const result = await loginHistoryRepository.findByUserIdAndDateRange(
        'user-123',
        startDate,
        endDate,
      );

      expect(result).toHaveLength(1);
      expect(result[0]).toBeInstanceOf(LoginHistory);
      expect(mockPrisma.loginHistory.findMany).toHaveBeenCalledWith({
        where: {
          userId: 'user-123',
          loginAt: {
            gte: startDate,
            lte: endDate,
          },
        },
        orderBy: { loginAt: 'desc' },
      });
    });
  });

  describe('findLatestByUserIdWithLimit', () => {
    it('should find latest login histories by user id with limit', async () => {
      const loginHistoriesData = [
        {
          id: 'history-1',
          userId: 'user-123',
          loginAt: new Date('2024-01-03T10:00:00Z'),
          createdAt: new Date('2024-01-03T10:00:00Z'),
        },
        {
          id: 'history-2',
          userId: 'user-123',
          loginAt: new Date('2024-01-02T10:00:00Z'),
          createdAt: new Date('2024-01-02T10:00:00Z'),
        },
      ];
      mockPrisma.loginHistory.findMany.mockResolvedValue(loginHistoriesData);

      const result = await loginHistoryRepository.findLatestByUserIdWithLimit(
        'user-123',
        2,
      );

      expect(result).toHaveLength(2);
      expect(result[0]).toBeInstanceOf(LoginHistory);
      expect(result[1]).toBeInstanceOf(LoginHistory);
      expect(mockPrisma.loginHistory.findMany).toHaveBeenCalledWith({
        where: { userId: 'user-123' },
        orderBy: { loginAt: 'desc' },
        take: 2,
      });
    });
  });

  describe('save', () => {
    it('should save login history', async () => {
      const loginHistory = LoginHistory.create('user-123', 'history-123');

      mockPrisma.loginHistory.create.mockResolvedValue({});

      await loginHistoryRepository.save(loginHistory);

      expect(mockPrisma.loginHistory.create).toHaveBeenCalledWith({
        data: {
          id: 'history-123',
          userId: 'user-123',
          loginAt: expect.any(Date),
          createdAt: expect.any(Date),
        },
      });
    });
  });

  describe('delete', () => {
    it('should delete login history', async () => {
      mockPrisma.loginHistory.delete.mockResolvedValue({});

      await loginHistoryRepository.delete('history-123');

      expect(mockPrisma.loginHistory.delete).toHaveBeenCalledWith({
        where: { id: 'history-123' },
      });
    });
  });
});
