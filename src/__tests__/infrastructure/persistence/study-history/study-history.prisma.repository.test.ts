import { StudyHistoryPrismaRepository } from '../../../../infrastructure/persistence/study-history/study-history.prisma.repository';
import { StudyHistory } from '../../../../domain/entity/study-history';

// Mock Prisma
jest.mock('../../../../infrastructure/persistence/prisma.client', () => ({
  prisma: {
    studyHistory: {
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

describe('StudyHistoryPrismaRepository', () => {
  let studyHistoryRepository: StudyHistoryPrismaRepository;
  let mockPrisma: any;

  beforeEach(() => {
    studyHistoryRepository = new StudyHistoryPrismaRepository();
    mockPrisma =
      require('../../../../infrastructure/persistence/prisma.client').prisma;
    jest.clearAllMocks();
  });

  describe('generateId', () => {
    it('should generate a new ID', async () => {
      const id = await studyHistoryRepository.generateId();
      expect(id).toBe('mocked-id');
    });
  });

  describe('findById', () => {
    it('should find study history by id', async () => {
      const studyHistoryData = {
        id: 'history-123',
        deckId: 'deck-123',
        progress: 0.75,
        createdAt: new Date('2024-01-01'),
      };
      mockPrisma.studyHistory.findUnique.mockResolvedValue(studyHistoryData);

      const result = await studyHistoryRepository.findById('history-123');

      expect(result).toBeInstanceOf(StudyHistory);
      expect(result!.id).toBe('history-123');
      expect(result!.deckId).toBe('deck-123');
      expect(result!.progress).toBe(0.75);
      expect(mockPrisma.studyHistory.findUnique).toHaveBeenCalledWith({
        where: { id: 'history-123' },
      });
    });

    it('should return null when study history not found', async () => {
      mockPrisma.studyHistory.findUnique.mockResolvedValue(null);

      const result = await studyHistoryRepository.findById('non-existent');

      expect(result).toBeNull();
    });
  });

  describe('findByDeckId', () => {
    it('should find study histories by deck id', async () => {
      const studyHistoriesData = [
        {
          id: 'history-1',
          deckId: 'deck-123',
          progress: 0.5,
          createdAt: new Date('2024-01-01'),
        },
        {
          id: 'history-2',
          deckId: 'deck-123',
          progress: 0.75,
          createdAt: new Date('2024-01-02'),
        },
      ];
      mockPrisma.studyHistory.findMany.mockResolvedValue(studyHistoriesData);

      const result = await studyHistoryRepository.findByDeckId('deck-123');

      expect(result).toHaveLength(2);
      expect(result[0]).toBeInstanceOf(StudyHistory);
      expect(result[1]).toBeInstanceOf(StudyHistory);
      expect(mockPrisma.studyHistory.findMany).toHaveBeenCalledWith({
        where: { deckId: 'deck-123' },
        orderBy: { createdAt: 'desc' },
      });
    });
  });

  describe('findLatestByDeckId', () => {
    it('should find latest study history by deck id', async () => {
      const studyHistoryData = {
        id: 'history-123',
        deckId: 'deck-123',
        progress: 0.8,
        createdAt: new Date('2024-01-02'),
      };
      mockPrisma.studyHistory.findFirst.mockResolvedValue(studyHistoryData);

      const result = await studyHistoryRepository.findLatestByDeckId(
        'deck-123',
      );

      expect(result).toBeInstanceOf(StudyHistory);
      expect(result!.deckId).toBe('deck-123');
      expect(result!.progress).toBe(0.8);
      expect(mockPrisma.studyHistory.findFirst).toHaveBeenCalledWith({
        where: { deckId: 'deck-123' },
        orderBy: { createdAt: 'desc' },
      });
    });

    it('should return null when no study history found', async () => {
      mockPrisma.studyHistory.findFirst.mockResolvedValue(null);

      const result = await studyHistoryRepository.findLatestByDeckId(
        'deck-123',
      );

      expect(result).toBeNull();
    });
  });

  describe('findByDeckIdAndDateRange', () => {
    it('should find study histories by deck id and date range', async () => {
      const startDate = new Date('2024-01-01');
      const endDate = new Date('2024-01-31');
      const studyHistoriesData = [
        {
          id: 'history-1',
          deckId: 'deck-123',
          progress: 0.5,
          createdAt: new Date('2024-01-15'),
        },
      ];
      mockPrisma.studyHistory.findMany.mockResolvedValue(studyHistoriesData);

      const result = await studyHistoryRepository.findByDeckIdAndDateRange(
        'deck-123',
        startDate,
        endDate,
      );

      expect(result).toHaveLength(1);
      expect(result[0]).toBeInstanceOf(StudyHistory);
      expect(mockPrisma.studyHistory.findMany).toHaveBeenCalledWith({
        where: {
          deckId: 'deck-123',
          createdAt: {
            gte: startDate,
            lte: endDate,
          },
        },
        orderBy: { createdAt: 'desc' },
      });
    });
  });

  describe('save', () => {
    it('should save study history', async () => {
      const studyHistory = StudyHistory.create('deck-123', 60, 'history-123');

      mockPrisma.studyHistory.create.mockResolvedValue({});

      await studyHistoryRepository.save(studyHistory);

      expect(mockPrisma.studyHistory.create).toHaveBeenCalledWith({
        data: {
          id: 'history-123',
          deckId: 'deck-123',
          progress: 60,
          createdAt: expect.any(Date),
        },
      });
    });
  });

  describe('delete', () => {
    it('should delete study history', async () => {
      mockPrisma.studyHistory.delete.mockResolvedValue({});

      await studyHistoryRepository.delete('history-123');

      expect(mockPrisma.studyHistory.delete).toHaveBeenCalledWith({
        where: { id: 'history-123' },
      });
    });
  });
});
