import { DeckPrismaRepository } from '../../../../infrastructure/persistence/deck/deck.prisma.repository';
import { Deck } from '../../../../domain/entity/deck';
import { Card } from '../../../../domain/entity/card';
import { CardStatusValue } from '../../../../domain/value-object/card-status';

// Mock Prisma
jest.mock('../../../../infrastructure/persistence/prisma.client', () => ({
  prisma: {
    deck: {
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

describe('DeckPrismaRepository', () => {
  let deckRepository: DeckPrismaRepository;
  let mockPrisma: any;

  beforeEach(() => {
    deckRepository = new DeckPrismaRepository();
    mockPrisma =
      require('../../../../infrastructure/persistence/prisma.client').prisma;
    jest.clearAllMocks();
  });

  describe('generateId', () => {
    it('should generate a new ID', async () => {
      const id = await deckRepository.generateId();
      expect(id).toBe('mocked-id');
    });
  });

  describe('findById', () => {
    it('should find deck by id', async () => {
      const deckData = {
        id: 'deck-123',
        title: 'TypeScript Basics',
        userId: 'user-123',
        description: 'Learn TypeScript fundamentals',
        cardCount: 2,
        progress: 0.5,
        lastStudied: new Date('2024-01-01'),
        shareCode: 'share-123',
        cards: [
          {
            id: 'card-1',
            front: 'What is TypeScript?',
            back: 'A typed superset of JavaScript',
            order: 0,
            status: 'UNLEARNED',
            favorite: false,
          },
          {
            id: 'card-2',
            front: 'What is an interface?',
            back: 'A contract that defines the structure of an object',
            order: 1,
            status: 'MASTERED',
            favorite: true,
          },
        ],
        groups: [],
      };
      mockPrisma.deck.findUnique.mockResolvedValue(deckData);

      const result = await deckRepository.findById('deck-123');

      expect(result).toBeInstanceOf(Deck);
      expect(result!.id).toBe('deck-123');
      expect(result!.title).toBe('TypeScript Basics');
      expect(result!.cards).toHaveLength(2);
      expect(result!.cards[0].status.value).toBe('UNLEARNED');
      expect(result!.cards[1].status.value).toBe('MASTERED');
      expect(mockPrisma.deck.findUnique).toHaveBeenCalledWith({
        where: { id: 'deck-123' },
        include: {
          cards: {
            orderBy: { order: 'asc' },
          },
          groups: true,
        },
      });
    });

    it('should return null when deck not found', async () => {
      mockPrisma.deck.findUnique.mockResolvedValue(null);

      const result = await deckRepository.findById('non-existent');

      expect(result).toBeNull();
    });
  });

  describe('findByUserId', () => {
    it('should find decks by user id', async () => {
      const decksData = [
        {
          id: 'deck-1',
          title: 'Deck 1',
          userId: 'user-123',
          description: 'First deck',
          cardCount: 1,
          progress: 0.0,
          lastStudied: new Date('2024-01-01'),
          shareCode: 'share-1',
          cards: [],
          groups: [],
        },
        {
          id: 'deck-2',
          title: 'Deck 2',
          userId: 'user-123',
          description: 'Second deck',
          cardCount: 2,
          progress: 0.5,
          lastStudied: new Date('2024-01-02'),
          shareCode: 'share-2',
          cards: [],
          groups: [],
        },
      ];
      mockPrisma.deck.findMany.mockResolvedValue(decksData);

      const result = await deckRepository.findByUserId('user-123');

      expect(result).toHaveLength(2);
      expect(result[0]).toBeInstanceOf(Deck);
      expect(result[1]).toBeInstanceOf(Deck);
      expect(mockPrisma.deck.findMany).toHaveBeenCalledWith({
        where: { userId: 'user-123' },
        include: {
          cards: {
            orderBy: { order: 'asc' },
          },
          groups: true,
        },
        orderBy: { lastStudied: 'desc' },
      });
    });
  });

  describe('save', () => {
    it('should create new deck', async () => {
      const deck = Deck.create(
        {
          title: 'New Deck',
          userId: 'user-123',
        },
        'deck-123',
      );
      deck.addCard({ front: 'Q1', back: 'A1' }, 'card-1');
      deck.addCard({ front: 'Q2', back: 'A2' }, 'card-2');

      mockPrisma.deck.upsert.mockResolvedValue({});

      await deckRepository.save(deck);

      expect(mockPrisma.deck.upsert).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'deck-123' },
          create: expect.objectContaining({
            id: 'deck-123',
            title: 'New Deck',
            userId: 'user-123',
            cards: expect.objectContaining({
              create: expect.arrayContaining([
                expect.objectContaining({
                  front: 'Q1',
                  back: 'A1',
                }),
                expect.objectContaining({
                  front: 'Q2',
                  back: 'A2',
                }),
              ]),
            }),
          }),
          update: expect.objectContaining({
            title: 'New Deck',
            cards: expect.objectContaining({
              deleteMany: {},
              create: expect.any(Array),
            }),
          }),
        }),
      );
    });

    it('should update existing deck', async () => {
      const deck = Deck.create(
        {
          title: 'Updated Deck',
          userId: 'user-123',
        },
        'deck-123',
      );

      mockPrisma.deck.upsert.mockResolvedValue({});

      await deckRepository.save(deck);

      expect(mockPrisma.deck.upsert).toHaveBeenCalled();
    });
  });

  describe('delete', () => {
    it('should delete deck', async () => {
      mockPrisma.deck.delete.mockResolvedValue({});

      await deckRepository.delete('deck-123');

      expect(mockPrisma.deck.delete).toHaveBeenCalledWith({
        where: { id: 'deck-123' },
      });
    });
  });
});
