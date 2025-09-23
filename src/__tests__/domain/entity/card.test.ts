import { Card } from '../../../domain/entity/card';
import { CardStatusValue } from '../../../domain/value-object/card-status';

// Mock nanoid
jest.mock('nanoid', () => ({
  nanoid: jest.fn(() => 'mocked-id'),
}));

describe('Card Entity', () => {
  describe('create', () => {
    it('should create a new card with default values', () => {
      const card = Card.create(
        {
          front: 'What is TypeScript?',
          back: 'A typed superset of JavaScript',
          order: 0,
        },
        'card-123',
      );

      expect(card.id).toBe('card-123');
      expect(card.front).toBe('What is TypeScript?');
      expect(card.back).toBe('A typed superset of JavaScript');
      expect(card.order).toBe(0);
      expect(card.status.value).toBe('UNLEARNED');
      expect(card.isFavorite).toBe(false);
    });
  });

  describe('fromPersistence', () => {
    it('should create a card from persistence data', () => {
      const card = Card.fromPersistence({
        id: 'card-456',
        front: 'What is React?',
        back: 'A JavaScript library for building user interfaces',
        order: 1,
        status: CardStatusValue.mastered(),
        isFavorite: true,
      });

      expect(card.id).toBe('card-456');
      expect(card.front).toBe('What is React?');
      expect(card.back).toBe(
        'A JavaScript library for building user interfaces',
      );
      expect(card.order).toBe(1);
      expect(card.status.value).toBe('MASTERED');
      expect(card.isFavorite).toBe(true);
    });
  });

  describe('updateContent', () => {
    it('should update card content', () => {
      const card = Card.create(
        {
          front: 'Original front',
          back: 'Original back',
          order: 0,
        },
        'card-123',
      );

      card.updateContent({
        front: 'Updated front',
        back: 'Updated back',
      });

      expect(card.front).toBe('Updated front');
      expect(card.back).toBe('Updated back');
    });

    it('should update only specified fields', () => {
      const card = Card.create(
        {
          front: 'Original front',
          back: 'Original back',
          order: 0,
        },
        'card-123',
      );

      card.updateContent({
        front: 'Updated front',
      });

      expect(card.front).toBe('Updated front');
      expect(card.back).toBe('Original back');
    });
  });

  describe('changeStatus', () => {
    it('should change card status', () => {
      const card = Card.create(
        {
          front: 'Test front',
          back: 'Test back',
          order: 0,
        },
        'card-123',
      );

      card.changeStatus(CardStatusValue.mastered());
      expect(card.status.value).toBe('MASTERED');

      card.changeStatus(CardStatusValue.struggling());
      expect(card.status.value).toBe('STRUGGLING');
    });
  });

  describe('toggleFavorite', () => {
    it('should toggle favorite status', () => {
      const card = Card.create(
        {
          front: 'Test front',
          back: 'Test back',
          order: 0,
        },
        'card-123',
      );

      expect(card.isFavorite).toBe(false);

      card.toggleFavorite();
      expect(card.isFavorite).toBe(true);

      card.toggleFavorite();
      expect(card.isFavorite).toBe(false);
    });
  });

  describe('changeOrder', () => {
    it('should change card order', () => {
      const card = Card.create(
        {
          front: 'Test front',
          back: 'Test back',
          order: 0,
        },
        'card-123',
      );

      card.changeOrder(5);
      expect(card.order).toBe(5);
    });
  });
});
