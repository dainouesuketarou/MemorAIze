import { DeckSettingPrismaRepository } from '../../../../infrastructure/persistence/deck-setting/deck-setting.prisma.repository';
import { DeckSetting } from '../../../../domain/entity/deck-setting';
import { FilterModeCollection } from '../../../../domain/value-object/filter-mode';

// Mock Prisma
jest.mock('../../../../infrastructure/persistence/prisma.client', () => ({
  prisma: {
    deckSetting: {
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

describe('DeckSettingPrismaRepository', () => {
  let deckSettingRepository: DeckSettingPrismaRepository;
  let mockPrisma: any;

  beforeEach(() => {
    deckSettingRepository = new DeckSettingPrismaRepository();
    mockPrisma =
      require('../../../../infrastructure/persistence/prisma.client').prisma;
    jest.clearAllMocks();
  });

  describe('generateId', () => {
    it('should generate a new ID', async () => {
      const id = await deckSettingRepository.generateId();
      expect(id).toBe('mocked-id');
    });
  });

  describe('findById', () => {
    it('should find deck setting by id', async () => {
      const deckSettingData = {
        id: 'setting-123',
        userId: 'user-123',
        deckId: 'deck-123',
        autoSpeak: true,
        reverse: false,
        filterMode: ['UNLEARNED', 'MASTERED'],
        shuffle: true,
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01'),
      };
      mockPrisma.deckSetting.findUnique.mockResolvedValue(deckSettingData);

      const result = await deckSettingRepository.findById('setting-123');

      expect(result).toBeInstanceOf(DeckSetting);
      expect(result!.id).toBe('setting-123');
      expect(result!.userId).toBe('user-123');
      expect(result!.deckId).toBe('deck-123');
      expect(result!.autoSpeak).toBe(true);
      expect(result!.filterMode.values).toEqual(['UNLEARNED', 'MASTERED']);
      expect(mockPrisma.deckSetting.findUnique).toHaveBeenCalledWith({
        where: { id: 'setting-123' },
      });
    });

    it('should return null when deck setting not found', async () => {
      mockPrisma.deckSetting.findUnique.mockResolvedValue(null);

      const result = await deckSettingRepository.findById('non-existent');

      expect(result).toBeNull();
    });
  });

  describe('findByUserIdAndDeckId', () => {
    it('should find deck setting by user id and deck id', async () => {
      const deckSettingData = {
        id: 'setting-123',
        userId: 'user-123',
        deckId: 'deck-123',
        autoSpeak: false,
        reverse: true,
        filterMode: ['STRUGGLING'],
        shuffle: false,
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01'),
      };
      mockPrisma.deckSetting.findUnique.mockResolvedValue(deckSettingData);

      const result = await deckSettingRepository.findByUserIdAndDeckId(
        'user-123',
        'deck-123',
      );

      expect(result).toBeInstanceOf(DeckSetting);
      expect(result!.userId).toBe('user-123');
      expect(result!.deckId).toBe('deck-123');
      expect(result!.filterMode.values).toEqual(['STRUGGLING']);
      expect(mockPrisma.deckSetting.findUnique).toHaveBeenCalledWith({
        where: {
          userId_deckId: {
            userId: 'user-123',
            deckId: 'deck-123',
          },
        },
      });
    });
  });

  describe('findByUserId', () => {
    it('should find deck settings by user id', async () => {
      const deckSettingsData = [
        {
          id: 'setting-1',
          userId: 'user-123',
          deckId: 'deck-1',
          autoSpeak: true,
          reverse: false,
          filterMode: ['UNLEARNED'],
          shuffle: true,
          createdAt: new Date('2024-01-01'),
          updatedAt: new Date('2024-01-01'),
        },
        {
          id: 'setting-2',
          userId: 'user-123',
          deckId: 'deck-2',
          autoSpeak: false,
          reverse: true,
          filterMode: ['MASTERED'],
          shuffle: false,
          createdAt: new Date('2024-01-02'),
          updatedAt: new Date('2024-01-02'),
        },
      ];
      mockPrisma.deckSetting.findMany.mockResolvedValue(deckSettingsData);

      const result = await deckSettingRepository.findByUserId('user-123');

      expect(result).toHaveLength(2);
      expect(result[0]).toBeInstanceOf(DeckSetting);
      expect(result[1]).toBeInstanceOf(DeckSetting);
      expect(mockPrisma.deckSetting.findMany).toHaveBeenCalledWith({
        where: { userId: 'user-123' },
        orderBy: { updatedAt: 'desc' },
      });
    });
  });

  describe('save', () => {
    it('should create new deck setting', async () => {
      const deckSetting = DeckSetting.create(
        'user-123',
        'deck-123',
        'setting-123',
      );

      mockPrisma.deckSetting.upsert.mockResolvedValue({});

      await deckSettingRepository.save(deckSetting);

      expect(mockPrisma.deckSetting.upsert).toHaveBeenCalledWith({
        where: {
          userId_deckId: {
            userId: 'user-123',
            deckId: 'deck-123',
          },
        },
        create: expect.objectContaining({
          id: 'setting-123',
          userId: 'user-123',
          deckId: 'deck-123',
          autoSpeak: false,
          reverse: false,
          filterMode: [],
          shuffle: false,
          createdAt: expect.any(Date),
          updatedAt: expect.any(Date),
        }),
        update: expect.objectContaining({
          autoSpeak: false,
          reverse: false,
          filterMode: [],
          shuffle: false,
          updatedAt: expect.any(Date),
        }),
      });
    });

    it('should update existing deck setting', async () => {
      const deckSetting = DeckSetting.create(
        'user-123',
        'deck-123',
        'setting-123',
      );
      deckSetting.setAutoSpeak(true);
      deckSetting.setReverse(true);
      deckSetting.setShuffle(true);

      mockPrisma.deckSetting.upsert.mockResolvedValue({});

      await deckSettingRepository.save(deckSetting);

      expect(mockPrisma.deckSetting.upsert).toHaveBeenCalledWith({
        where: {
          userId_deckId: {
            userId: 'user-123',
            deckId: 'deck-123',
          },
        },
        create: expect.any(Object),
        update: expect.objectContaining({
          autoSpeak: true,
          reverse: true,
          shuffle: true,
        }),
      });
    });
  });

  describe('delete', () => {
    it('should delete deck setting', async () => {
      mockPrisma.deckSetting.delete.mockResolvedValue({});

      await deckSettingRepository.delete('setting-123');

      expect(mockPrisma.deckSetting.delete).toHaveBeenCalledWith({
        where: { id: 'setting-123' },
      });
    });
  });
});
