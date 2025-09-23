import { CardPrismaRepository } from '../../../../infrastructure/persistence/card/card.prisma.repository';
import { Card } from '../../../../domain/entity/card';
import { CardStatusValue } from '../../../../domain/value-object/card-status';

// Mock Prisma
jest.mock('../../../../infrastructure/persistence/prisma.client', () => ({
  prisma: {
    card: {
      findUnique: jest.fn(),
      findMany: jest.fn(),
      upsert: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  },
}));

// Mock nanoid
jest.mock('nanoid', () => ({
  nanoid: jest.fn(() => 'mocked-id'),
}));

describe('CardPrismaRepository', () => {
  let cardRepository: CardPrismaRepository;
  let mockPrisma: any;

  beforeEach(() => {
    cardRepository = new CardPrismaRepository();
    mockPrisma =
      require('../../../../infrastructure/persistence/prisma.client').prisma;
    jest.clearAllMocks();
  });

  describe('generateId', () => {
    it('should generate a new ID', async () => {
      const id = await cardRepository.generateId();
      expect(id).toBe('mocked-id');
    });
  });

  describe('findById', () => {
    it('should find card by id', async () => {
      const cardData = {
        id: 'card-123',
        front: 'What is TypeScript?',
        back: 'A typed superset of JavaScript',
        order: 0,
        status: 'UNLEARNED',
        favorite: false,
      };
      mockPrisma.card.findUnique.mockResolvedValue(cardData);

      const result = await cardRepository.findById('card-123');

      expect(result).toBeInstanceOf(Card);
      expect(result!.id).toBe('card-123');
      expect(result!.front).toBe('What is TypeScript?');
      expect(result!.status.value).toBe('UNLEARNED');
      expect(mockPrisma.card.findUnique).toHaveBeenCalledWith({
        where: { id: 'card-123' },
      });
    });

    it('should return null when card not found', async () => {
      mockPrisma.card.findUnique.mockResolvedValue(null);

      const result = await cardRepository.findById('non-existent');

      expect(result).toBeNull();
    });
  });

  describe('findByDeckId', () => {
    it('should find cards by deck id', async () => {
      const cardsData = [
        {
          id: 'card-1',
          front: 'Question 1',
          back: 'Answer 1',
          order: 0,
          status: 'UNLEARNED',
          favorite: false,
        },
        {
          id: 'card-2',
          front: 'Question 2',
          back: 'Answer 2',
          order: 1,
          status: 'MASTERED',
          favorite: true,
        },
      ];
      mockPrisma.card.findMany.mockResolvedValue(cardsData);

      const result = await cardRepository.findByDeckId('deck-123');

      expect(result).toHaveLength(2);
      expect(result[0]).toBeInstanceOf(Card);
      expect(result[1]).toBeInstanceOf(Card);
      expect(mockPrisma.card.findMany).toHaveBeenCalledWith({
        where: { deckId: 'deck-123' },
        orderBy: { order: 'asc' },
      });
    });
  });

  describe('save', () => {
    it('should save card with deck id', async () => {
      const card = Card.create(
        {
          front: 'What is React?',
          back: 'A JavaScript library for building user interfaces',
          order: 0,
        },
        'card-123',
      );

      mockPrisma.card.upsert.mockResolvedValue({});

      await cardRepository.save(card, 'deck-123');

      expect(mockPrisma.card.upsert).toHaveBeenCalledWith({
        where: { id: 'card-123' },
        create: expect.objectContaining({
          id: 'card-123',
          front: 'What is React?',
          back: 'A JavaScript library for building user interfaces',
          order: 0,
          status: 'UNLEARNED',
          favorite: false,
          deckId: 'deck-123',
        }),
        update: expect.objectContaining({
          front: 'What is React?',
          back: 'A JavaScript library for building user interfaces',
          order: 0,
          status: 'UNLEARNED',
          favorite: false,
        }),
      });
    });
  });

  describe('updateOrder', () => {
    it('should update card order', async () => {
      mockPrisma.card.update.mockResolvedValue({});

      await cardRepository.updateOrder('deck-123', [
        'card-1',
        'card-2',
        'card-3',
      ]);

      expect(mockPrisma.card.update).toHaveBeenCalledTimes(3);
      expect(mockPrisma.card.update).toHaveBeenNthCalledWith(1, {
        where: { id: 'card-1' },
        data: { order: 0 },
      });
      expect(mockPrisma.card.update).toHaveBeenNthCalledWith(2, {
        where: { id: 'card-2' },
        data: { order: 1 },
      });
      expect(mockPrisma.card.update).toHaveBeenNthCalledWith(3, {
        where: { id: 'card-3' },
        data: { order: 2 },
      });
    });
  });

  describe('delete', () => {
    it('should delete card', async () => {
      mockPrisma.card.delete.mockResolvedValue({});

      await cardRepository.delete('card-123');

      expect(mockPrisma.card.delete).toHaveBeenCalledWith({
        where: { id: 'card-123' },
      });
    });
  });
});
