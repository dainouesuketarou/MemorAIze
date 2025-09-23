import { DeckSetting } from '../../../domain/entity/deck-setting';
import {
  FilterModeCollection,
  FilterMode,
} from '../../../domain/value-object/filter-mode';

// Mock nanoid
jest.mock('nanoid', () => ({
  nanoid: jest.fn(() => 'mocked-id'),
}));

describe('DeckSetting Entity', () => {
  describe('create', () => {
    it('should create a new deck setting with default values', () => {
      const deckSetting = DeckSetting.create(
        'user-123',
        'deck-123',
        'setting-123',
      );

      expect(deckSetting.id).toBe('setting-123');
      expect(deckSetting.userId).toBe('user-123');
      expect(deckSetting.deckId).toBe('deck-123');
      expect(deckSetting.autoSpeak).toBe(false);
      expect(deckSetting.reverse).toBe(false);
      expect(deckSetting.filterMode.isEmpty()).toBe(true);
      expect(deckSetting.shuffle).toBe(false);
    });
  });

  describe('fromPersistence', () => {
    it('should create deck setting from persistence data', () => {
      const createdAt = new Date('2024-01-01T10:00:00Z');
      const updatedAt = new Date('2024-01-02T10:00:00Z');
      const deckSetting = DeckSetting.fromPersistence({
        id: 'setting-123',
        userId: 'user-456',
        deckId: 'deck-789',
        autoSpeak: true,
        reverse: false,
        filterMode: FilterModeCollection.fromArray([
          FilterMode.UNLEARNED,
          FilterMode.MASTERED,
        ]),
        shuffle: true,
        createdAt,
        updatedAt,
      });

      expect(deckSetting.id).toBe('setting-123');
      expect(deckSetting.userId).toBe('user-456');
      expect(deckSetting.deckId).toBe('deck-789');
      expect(deckSetting.autoSpeak).toBe(true);
      expect(deckSetting.reverse).toBe(false);
      expect(deckSetting.filterMode.values).toEqual([
        FilterMode.UNLEARNED,
        FilterMode.MASTERED,
      ]);
      expect(deckSetting.shuffle).toBe(true);
      expect(deckSetting.createdAt).toEqual(createdAt);
      expect(deckSetting.updatedAt).toEqual(updatedAt);
    });
  });

  describe('setAutoSpeak', () => {
    it('should set auto speak setting', () => {
      const deckSetting = DeckSetting.create(
        'user-123',
        'deck-123',
        'setting-123',
      );
      const initialUpdatedAt = deckSetting.updatedAt;

      deckSetting.setAutoSpeak(true);
      expect(deckSetting.autoSpeak).toBe(true);
      expect(deckSetting.updatedAt.getTime()).toBeGreaterThanOrEqual(
        initialUpdatedAt.getTime(),
      );

      deckSetting.setAutoSpeak(false);
      expect(deckSetting.autoSpeak).toBe(false);
    });
  });

  describe('setReverse', () => {
    it('should set reverse setting', () => {
      const deckSetting = DeckSetting.create(
        'user-123',
        'deck-123',
        'setting-123',
      );
      const initialUpdatedAt = deckSetting.updatedAt;

      deckSetting.setReverse(true);
      expect(deckSetting.reverse).toBe(true);
      expect(deckSetting.updatedAt.getTime()).toBeGreaterThanOrEqual(
        initialUpdatedAt.getTime(),
      );

      deckSetting.setReverse(false);
      expect(deckSetting.reverse).toBe(false);
    });
  });

  describe('setFilterMode', () => {
    it('should set filter mode', () => {
      const deckSetting = DeckSetting.create(
        'user-123',
        'deck-123',
        'setting-123',
      );
      const initialUpdatedAt = deckSetting.updatedAt;

      deckSetting.setFilterMode([FilterMode.UNLEARNED, FilterMode.STRUGGLING]);
      expect(deckSetting.filterMode.values).toEqual([
        FilterMode.UNLEARNED,
        FilterMode.STRUGGLING,
      ]);
      expect(deckSetting.updatedAt.getTime()).toBeGreaterThanOrEqual(
        initialUpdatedAt.getTime(),
      );

      deckSetting.setFilterMode([]);
      expect(deckSetting.filterMode.isEmpty()).toBe(true);
    });
  });

  describe('setShuffle', () => {
    it('should set shuffle setting', () => {
      const deckSetting = DeckSetting.create(
        'user-123',
        'deck-123',
        'setting-123',
      );
      const initialUpdatedAt = deckSetting.updatedAt;

      deckSetting.setShuffle(true);
      expect(deckSetting.shuffle).toBe(true);
      expect(deckSetting.updatedAt.getTime()).toBeGreaterThanOrEqual(
        initialUpdatedAt.getTime(),
      );

      deckSetting.setShuffle(false);
      expect(deckSetting.shuffle).toBe(false);
    });
  });

  describe('hasFilterMode', () => {
    it('should check if filter mode exists', () => {
      const deckSetting = DeckSetting.create(
        'user-123',
        'deck-123',
        'setting-123',
      );
      deckSetting.setFilterMode([FilterMode.UNLEARNED, FilterMode.FAVORITE]);

      expect(deckSetting.hasFilterMode(FilterMode.UNLEARNED)).toBe(true);
      expect(deckSetting.hasFilterMode(FilterMode.FAVORITE)).toBe(true);
      expect(deckSetting.hasFilterMode(FilterMode.MASTERED)).toBe(false);
    });
  });

  describe('addFilterMode', () => {
    it('should add filter mode', () => {
      const deckSetting = DeckSetting.create(
        'user-123',
        'deck-123',
        'setting-123',
      );
      const initialUpdatedAt = deckSetting.updatedAt;

      deckSetting.addFilterMode(FilterMode.UNLEARNED);
      expect(deckSetting.filterMode.values).toEqual([FilterMode.UNLEARNED]);
      expect(deckSetting.updatedAt.getTime()).toBeGreaterThanOrEqual(
        initialUpdatedAt.getTime(),
      );

      deckSetting.addFilterMode(FilterMode.MASTERED);
      expect(deckSetting.filterMode.values).toEqual([
        FilterMode.UNLEARNED,
        FilterMode.MASTERED,
      ]);
    });

    it('should not add duplicate filter mode', () => {
      const deckSetting = DeckSetting.create(
        'user-123',
        'deck-123',
        'setting-123',
      );

      deckSetting.addFilterMode(FilterMode.UNLEARNED);
      deckSetting.addFilterMode(FilterMode.UNLEARNED); // Duplicate

      expect(deckSetting.filterMode.values).toEqual([FilterMode.UNLEARNED]);
    });
  });

  describe('removeFilterMode', () => {
    it('should remove filter mode', () => {
      const deckSetting = DeckSetting.create(
        'user-123',
        'deck-123',
        'setting-123',
      );
      deckSetting.setFilterMode([
        FilterMode.UNLEARNED,
        FilterMode.MASTERED,
        FilterMode.FAVORITE,
      ]);
      const initialUpdatedAt = deckSetting.updatedAt;

      deckSetting.removeFilterMode(FilterMode.MASTERED);
      expect(deckSetting.filterMode.values).toEqual([
        FilterMode.UNLEARNED,
        FilterMode.FAVORITE,
      ]);
      expect(deckSetting.updatedAt.getTime()).toBeGreaterThanOrEqual(
        initialUpdatedAt.getTime(),
      );

      deckSetting.removeFilterMode(FilterMode.UNLEARNED);
      expect(deckSetting.filterMode.values).toEqual([FilterMode.FAVORITE]);
    });

    it('should not throw error when removing non-existent filter mode', () => {
      const deckSetting = DeckSetting.create(
        'user-123',
        'deck-123',
        'setting-123',
      );
      deckSetting.setFilterMode([FilterMode.UNLEARNED]);

      expect(() => {
        deckSetting.removeFilterMode(FilterMode.MASTERED);
      }).not.toThrow();
      expect(deckSetting.filterMode.values).toEqual([FilterMode.UNLEARNED]);
    });
  });
});
