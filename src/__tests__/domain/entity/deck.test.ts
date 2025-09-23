import { Deck } from '../../../domain/entity/deck';
import { Card } from '../../../domain/entity/card';
import { CardStatusValue } from '../../../domain/value-object/card-status';

// Mock nanoid
jest.mock('nanoid', () => ({
  nanoid: jest.fn(() => 'mocked-id'),
}));

describe('Deck Entity', () => {
  describe('create', () => {
    it('should create a new deck with default values', () => {
      const deck = Deck.create(
        {
          title: 'TypeScript Basics',
          userId: 'user-123',
        },
        'deck-123',
      );

      expect(deck.id).toBe('deck-123');
      expect(deck.title).toBe('TypeScript Basics');
      expect(deck.userId).toBe('user-123');
      expect(deck.description).toBe(null);
      expect(deck.cards).toEqual([]);
      expect(deck.cardCount).toBe(0);
      expect(deck.progress).toBe(0);
      expect(deck.lastStudied).toBe(null);
      expect(deck.shareCode).toBe('');
      expect(deck.groupIds).toEqual([]);
    });
  });

  describe('fromPersistence', () => {
    it('should create a deck from persistence data', () => {
      const card = Card.create(
        {
          front: 'Test front',
          back: 'Test back',
          order: 0,
        },
        'card-123',
      );

      const deck = Deck.fromPersistence({
        id: 'deck-456',
        title: 'React Basics',
        userId: 'user-456',
        description: 'Learn React fundamentals',
        cards: [card],
        cardCount: 1,
        progress: 0.5,
        lastStudied: new Date('2023-01-01'),
        shareCode: 'ABC123',
        groupIds: ['group-1'],
      });

      expect(deck.id).toBe('deck-456');
      expect(deck.title).toBe('React Basics');
      expect(deck.userId).toBe('user-456');
      expect(deck.description).toBe('Learn React fundamentals');
      expect(deck.cards).toHaveLength(1);
      expect(deck.cardCount).toBe(1);
      expect(deck.progress).toBe(0.5);
      expect(deck.lastStudied).toEqual(new Date('2023-01-01'));
      expect(deck.shareCode).toBe('ABC123');
      expect(deck.groupIds).toEqual(['group-1']);
    });
  });

  describe('changeTitle', () => {
    it('should change deck title', () => {
      const deck = Deck.create(
        {
          title: 'Original Title',
          userId: 'user-123',
        },
        'deck-123',
      );

      deck.changeTitle('New Title');
      expect(deck.title).toBe('New Title');
    });

    it('should throw error for empty title', () => {
      const deck = Deck.create(
        {
          title: 'Original Title',
          userId: 'user-123',
        },
        'deck-123',
      );

      expect(() => deck.changeTitle('')).toThrow('Title cannot be empty.');
    });
  });

  describe('addCard', () => {
    it('should add a card to the deck', () => {
      const deck = Deck.create(
        {
          title: 'Test Deck',
          userId: 'user-123',
        },
        'deck-123',
      );

      const newCard = deck.addCard(
        {
          front: 'What is TypeScript?',
          back: 'A typed superset of JavaScript',
        },
        'card-123',
      );

      expect(deck.cards).toHaveLength(1);
      expect(deck.cards[0]).toBe(newCard);
      expect(newCard.order).toBe(0);
    });

    it('should add multiple cards with correct order', () => {
      const deck = Deck.create(
        {
          title: 'Test Deck',
          userId: 'user-123',
        },
        'deck-123',
      );

      const card1 = deck.addCard(
        {
          front: 'Question 1',
          back: 'Answer 1',
        },
        'card-1',
      );

      const card2 = deck.addCard(
        {
          front: 'Question 2',
          back: 'Answer 2',
        },
        'card-2',
      );

      expect(deck.cards).toHaveLength(2);
      expect(card1.order).toBe(0);
      expect(card2.order).toBe(1);
    });
  });

  describe('removeCard', () => {
    it('should remove a card from the deck', () => {
      const deck = Deck.create(
        {
          title: 'Test Deck',
          userId: 'user-123',
        },
        'deck-123',
      );

      const card1 = deck.addCard(
        {
          front: 'Question 1',
          back: 'Answer 1',
        },
        'card-1',
      );

      const card2 = deck.addCard(
        {
          front: 'Question 2',
          back: 'Answer 2',
        },
        'card-2',
      );

      deck.removeCard(card1.id);

      expect(deck.cards).toHaveLength(1);
      expect(deck.cards[0].id).toBe(card2.id);
      expect(deck.cards[0].order).toBe(0); // Should be reordered
    });
  });

  describe('updateProgress', () => {
    it('should calculate progress correctly', () => {
      const deck = Deck.create(
        {
          title: 'Test Deck',
          userId: 'user-123',
        },
        'deck-123',
      );

      // Add 3 cards
      const card1 = deck.addCard({ front: 'Q1', back: 'A1' }, 'card-1');
      const card2 = deck.addCard({ front: 'Q2', back: 'A2' }, 'card-2');
      const card3 = deck.addCard({ front: 'Q3', back: 'A3' }, 'card-3');

      // Mark 2 cards as mastered
      card1.changeStatus(CardStatusValue.mastered());
      card2.changeStatus(CardStatusValue.mastered());
      card3.changeStatus(CardStatusValue.unlearned());

      deck.updateProgress();

      expect(deck.progress).toBe(2 / 3); // 2 out of 3 cards mastered
    });

    it('should handle empty deck', () => {
      const deck = Deck.create(
        {
          title: 'Empty Deck',
          userId: 'user-123',
        },
        'deck-123',
      );

      deck.updateProgress();

      expect(deck.progress).toBe(0);
    });
  });

  describe('updateLastStudied', () => {
    it('should update last studied date', () => {
      const deck = Deck.create(
        {
          title: 'Test Deck',
          userId: 'user-123',
        },
        'deck-123',
      );

      const beforeUpdate = deck.lastStudied;
      deck.updateLastStudied();
      const afterUpdate = deck.lastStudied;

      expect(beforeUpdate).toBe(null);
      expect(afterUpdate).toBeInstanceOf(Date);
      expect(afterUpdate!.getTime()).toBeGreaterThan(Date.now() - 1000); // Within last second
    });
  });
});
