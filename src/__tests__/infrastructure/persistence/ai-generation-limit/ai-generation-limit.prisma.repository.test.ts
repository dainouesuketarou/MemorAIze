import { AiGenerationLimitPrismaRepository } from '../../../../infrastructure/persistence/ai-generation-limit/ai-generation-limit.prisma.repository';
import { AiGenerationLimit } from '../../../../domain/entity/ai-generation-limit';

// Mock Prisma
jest.mock('../../../../infrastructure/persistence/prisma.client', () => ({
  prisma: {
    aiGenerationLimit: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      upsert: jest.fn(),
      delete: jest.fn(),
    },
  },
}));

// Mock nanoid
jest.mock('nanoid', () => ({
  nanoid: jest.fn(() => 'mocked-id'),
}));

describe('AiGenerationLimitPrismaRepository', () => {
  let aiGenerationLimitRepository: AiGenerationLimitPrismaRepository;
  let mockPrisma: any;

  beforeEach(() => {
    aiGenerationLimitRepository = new AiGenerationLimitPrismaRepository();
    mockPrisma =
      require('../../../../infrastructure/persistence/prisma.client').prisma;
    jest.clearAllMocks();
  });

  describe('generateId', () => {
    it('should generate a new ID', async () => {
      const id = await aiGenerationLimitRepository.generateId();
      expect(id).toBe('mocked-id');
    });
  });

  describe('findById', () => {
    it('should find AI generation limit by id', async () => {
      const limitData = {
        id: 'limit-123',
        userId: 'user-123',
        month: new Date('2024-01-01'),
        count: 5,
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01'),
      };
      mockPrisma.aiGenerationLimit.findUnique.mockResolvedValue(limitData);

      const result = await aiGenerationLimitRepository.findById('limit-123');

      expect(result).toBeInstanceOf(AiGenerationLimit);
      expect(result!.id).toBe('limit-123');
      expect(result!.userId).toBe('user-123');
      expect(result!.count).toBe(5);
      expect(mockPrisma.aiGenerationLimit.findUnique).toHaveBeenCalledWith({
        where: { id: 'limit-123' },
      });
    });

    it('should return null when AI generation limit not found', async () => {
      mockPrisma.aiGenerationLimit.findUnique.mockResolvedValue(null);

      const result = await aiGenerationLimitRepository.findById('non-existent');

      expect(result).toBeNull();
    });
  });

  describe('findByUserIdAndMonth', () => {
    it('should find AI generation limit by user id and month', async () => {
      const month = new Date('2024-01-01');
      const limitData = {
        id: 'limit-123',
        userId: 'user-123',
        month: month,
        count: 3,
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01'),
      };
      mockPrisma.aiGenerationLimit.findUnique.mockResolvedValue(limitData);

      const result = await aiGenerationLimitRepository.findByUserIdAndMonth(
        'user-123',
        month,
      );

      expect(result).toBeInstanceOf(AiGenerationLimit);
      expect(result!.userId).toBe('user-123');
      expect(result!.month).toEqual(month);
      expect(result!.count).toBe(3);
      expect(mockPrisma.aiGenerationLimit.findUnique).toHaveBeenCalledWith({
        where: {
          userId_month: {
            userId: 'user-123',
            month: month,
          },
        },
      });
    });
  });

  describe('findByUserId', () => {
    it('should find AI generation limits by user id', async () => {
      const limitsData = [
        {
          id: 'limit-1',
          userId: 'user-123',
          month: new Date('2024-01-01'),
          count: 2,
          createdAt: new Date('2024-01-01'),
          updatedAt: new Date('2024-01-01'),
        },
        {
          id: 'limit-2',
          userId: 'user-123',
          month: new Date('2024-02-01'),
          count: 5,
          createdAt: new Date('2024-02-01'),
          updatedAt: new Date('2024-02-01'),
        },
      ];
      mockPrisma.aiGenerationLimit.findMany.mockResolvedValue(limitsData);

      const result = await aiGenerationLimitRepository.findByUserId('user-123');

      expect(result).toHaveLength(2);
      expect(result[0]).toBeInstanceOf(AiGenerationLimit);
      expect(result[1]).toBeInstanceOf(AiGenerationLimit);
      expect(mockPrisma.aiGenerationLimit.findMany).toHaveBeenCalledWith({
        where: { userId: 'user-123' },
        orderBy: { month: 'desc' },
      });
    });
  });

  describe('findByUserIdAndDateRange', () => {
    it('should find AI generation limits by user id and date range', async () => {
      const startMonth = new Date('2024-01-01');
      const endMonth = new Date('2024-03-01');
      const limitsData = [
        {
          id: 'limit-1',
          userId: 'user-123',
          month: new Date('2024-02-01'),
          count: 4,
          createdAt: new Date('2024-02-01'),
          updatedAt: new Date('2024-02-01'),
        },
      ];
      mockPrisma.aiGenerationLimit.findMany.mockResolvedValue(limitsData);

      const result = await aiGenerationLimitRepository.findByUserIdAndDateRange(
        'user-123',
        startMonth,
        endMonth,
      );

      expect(result).toHaveLength(1);
      expect(result[0]).toBeInstanceOf(AiGenerationLimit);
      expect(mockPrisma.aiGenerationLimit.findMany).toHaveBeenCalledWith({
        where: {
          userId: 'user-123',
          month: {
            gte: startMonth,
            lte: endMonth,
          },
        },
        orderBy: { month: 'desc' },
      });
    });
  });

  describe('save', () => {
    it('should create new AI generation limit', async () => {
      const month = new Date('2024-01-01');
      const aiGenerationLimit = AiGenerationLimit.create(
        'user-123',
        month,
        'limit-123',
      );

      mockPrisma.aiGenerationLimit.upsert.mockResolvedValue({});

      await aiGenerationLimitRepository.save(aiGenerationLimit);

      expect(mockPrisma.aiGenerationLimit.upsert).toHaveBeenCalledWith({
        where: {
          userId_month: {
            userId: 'user-123',
            month: month,
          },
        },
        create: expect.objectContaining({
          id: 'limit-123',
          userId: 'user-123',
          month: month,
          count: 0,
          createdAt: expect.any(Date),
          updatedAt: expect.any(Date),
        }),
        update: expect.objectContaining({
          count: 0,
          updatedAt: expect.any(Date),
        }),
      });
    });

    it('should update existing AI generation limit', async () => {
      const month = new Date('2024-01-01');
      const aiGenerationLimit = AiGenerationLimit.create(
        'user-123',
        month,
        'limit-123',
      );
      aiGenerationLimit.setCount(7);

      mockPrisma.aiGenerationLimit.upsert.mockResolvedValue({});

      await aiGenerationLimitRepository.save(aiGenerationLimit);

      expect(mockPrisma.aiGenerationLimit.upsert).toHaveBeenCalledWith({
        where: {
          userId_month: {
            userId: 'user-123',
            month: month,
          },
        },
        create: expect.any(Object),
        update: expect.objectContaining({
          count: 7,
          updatedAt: expect.any(Date),
        }),
      });
    });
  });

  describe('delete', () => {
    it('should delete AI generation limit', async () => {
      mockPrisma.aiGenerationLimit.delete.mockResolvedValue({});

      await aiGenerationLimitRepository.delete('limit-123');

      expect(mockPrisma.aiGenerationLimit.delete).toHaveBeenCalledWith({
        where: { id: 'limit-123' },
      });
    });
  });
});
