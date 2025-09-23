import {
  FilterModeValue,
  FilterMode,
} from '../../../domain/value-object/filter-mode';
import { FilterModeCollection } from '../../../domain/value-object/filter-mode';

describe('FilterModeValue Value Object', () => {
  describe('create', () => {
    it('should create a valid filter mode', () => {
      const mode = FilterModeValue.create(FilterMode.UNLEARNED);

      expect(mode.value).toBe(FilterMode.UNLEARNED);
    });

    it('should throw error for invalid filter mode', () => {
      expect(() => {
        FilterModeValue.create('INVALID' as any);
      }).toThrow('Invalid filter mode.');
    });
  });

  describe('factory methods', () => {
    it('should create unlearned mode', () => {
      const mode = FilterModeValue.unlearned();

      expect(mode.value).toBe(FilterMode.UNLEARNED);
    });

    it('should create mastered mode', () => {
      const mode = FilterModeValue.mastered();

      expect(mode.value).toBe(FilterMode.MASTERED);
    });

    it('should create struggling mode', () => {
      const mode = FilterModeValue.struggling();

      expect(mode.value).toBe(FilterMode.STRUGGLING);
    });

    it('should create favorite mode', () => {
      const mode = FilterModeValue.favorite();

      expect(mode.value).toBe(FilterMode.FAVORITE);
    });
  });

  describe('equals', () => {
    it('should return true for equal modes', () => {
      const mode1 = FilterModeValue.unlearned();
      const mode2 = FilterModeValue.unlearned();

      expect(mode1.equals(mode2)).toBe(true);
    });

    it('should return false for different modes', () => {
      const mode1 = FilterModeValue.unlearned();
      const mode2 = FilterModeValue.mastered();

      expect(mode1.equals(mode2)).toBe(false);
    });
  });

  describe('toString', () => {
    it('should return mode as string', () => {
      const mode = FilterModeValue.struggling();

      expect(mode.toString()).toBe(FilterMode.STRUGGLING);
    });
  });
});

describe('FilterModeCollection', () => {
  describe('empty', () => {
    it('should create empty collection', () => {
      const collection = FilterModeCollection.empty();

      expect(collection.isEmpty()).toBe(true);
      expect(collection.size()).toBe(0);
      expect(collection.values).toEqual([]);
    });
  });

  describe('fromArray', () => {
    it('should create collection from array', () => {
      const collection = FilterModeCollection.fromArray([
        FilterMode.UNLEARNED,
        FilterMode.MASTERED,
      ]);

      expect(collection.size()).toBe(2);
      expect(collection.values).toEqual([
        FilterMode.UNLEARNED,
        FilterMode.MASTERED,
      ]);
    });

    it('should create empty collection from empty array', () => {
      const collection = FilterModeCollection.fromArray([]);

      expect(collection.isEmpty()).toBe(true);
      expect(collection.size()).toBe(0);
    });
  });

  describe('fromSingle', () => {
    it('should create collection with single mode', () => {
      const collection = FilterModeCollection.fromSingle(FilterMode.UNLEARNED);

      expect(collection.size()).toBe(1);
      expect(collection.values).toEqual([FilterMode.UNLEARNED]);
    });
  });

  describe('fromPersistence', () => {
    it('should create collection from persistence data', () => {
      const collection = FilterModeCollection.fromPersistence([
        FilterMode.UNLEARNED,
        FilterMode.FAVORITE,
      ]);

      expect(collection.size()).toBe(2);
      expect(collection.values).toEqual([
        FilterMode.UNLEARNED,
        FilterMode.FAVORITE,
      ]);
    });
  });

  describe('has', () => {
    it('should check if mode exists in collection', () => {
      const collection = FilterModeCollection.fromArray([
        FilterMode.UNLEARNED,
        FilterMode.MASTERED,
      ]);

      expect(collection.has(FilterMode.UNLEARNED)).toBe(true);
      expect(collection.has(FilterMode.MASTERED)).toBe(true);
      expect(collection.has(FilterMode.STRUGGLING)).toBe(false);
    });
  });

  describe('add', () => {
    it('should add mode to collection', () => {
      const collection = FilterModeCollection.empty();

      const newCollection = collection.add(FilterMode.UNLEARNED);
      expect(newCollection.size()).toBe(1);
      expect(newCollection.values).toEqual([FilterMode.UNLEARNED]);

      const newerCollection = newCollection.add(FilterMode.MASTERED);
      expect(newerCollection.size()).toBe(2);
      expect(newerCollection.values).toEqual([
        FilterMode.UNLEARNED,
        FilterMode.MASTERED,
      ]);
    });

    it('should not add duplicate mode', () => {
      const collection = FilterModeCollection.fromSingle(FilterMode.UNLEARNED);

      const newCollection = collection.add(FilterMode.UNLEARNED);
      expect(newCollection.size()).toBe(1);
      expect(newCollection.values).toEqual([FilterMode.UNLEARNED]);
    });
  });

  describe('remove', () => {
    it('should remove mode from collection', () => {
      const collection = FilterModeCollection.fromArray([
        FilterMode.UNLEARNED,
        FilterMode.MASTERED,
        FilterMode.FAVORITE,
      ]);

      const newCollection = collection.remove(FilterMode.MASTERED);
      expect(newCollection.size()).toBe(2);
      expect(newCollection.values).toEqual([
        FilterMode.UNLEARNED,
        FilterMode.FAVORITE,
      ]);
    });

    it('should return same collection when removing non-existent mode', () => {
      const collection = FilterModeCollection.fromArray([FilterMode.UNLEARNED]);

      const newCollection = collection.remove(FilterMode.MASTERED);
      expect(newCollection.size()).toBe(1);
      expect(newCollection.values).toEqual([FilterMode.UNLEARNED]);
    });
  });

  describe('isEmpty', () => {
    it('should return true for empty collection', () => {
      const collection = FilterModeCollection.empty();

      expect(collection.isEmpty()).toBe(true);
    });

    it('should return false for non-empty collection', () => {
      const collection = FilterModeCollection.fromSingle(FilterMode.UNLEARNED);

      expect(collection.isEmpty()).toBe(false);
    });
  });

  describe('size', () => {
    it('should return correct size', () => {
      const collection1 = FilterModeCollection.empty();
      expect(collection1.size()).toBe(0);

      const collection2 = FilterModeCollection.fromSingle(FilterMode.UNLEARNED);
      expect(collection2.size()).toBe(1);

      const collection3 = FilterModeCollection.fromArray([
        FilterMode.UNLEARNED,
        FilterMode.MASTERED,
        FilterMode.STRUGGLING,
      ]);
      expect(collection3.size()).toBe(3);
    });
  });

  describe('equals', () => {
    it('should return true for equal collections', () => {
      const collection1 = FilterModeCollection.fromArray([
        FilterMode.UNLEARNED,
        FilterMode.MASTERED,
      ]);
      const collection2 = FilterModeCollection.fromArray([
        FilterMode.UNLEARNED,
        FilterMode.MASTERED,
      ]);

      expect(collection1.equals(collection2)).toBe(true);
    });

    it('should return false for different collections', () => {
      const collection1 = FilterModeCollection.fromArray([
        FilterMode.UNLEARNED,
      ]);
      const collection2 = FilterModeCollection.fromArray([FilterMode.MASTERED]);

      expect(collection1.equals(collection2)).toBe(false);
    });

    it('should return false for collections with different sizes', () => {
      const collection1 = FilterModeCollection.fromSingle(FilterMode.UNLEARNED);
      const collection2 = FilterModeCollection.fromArray([
        FilterMode.UNLEARNED,
        FilterMode.MASTERED,
      ]);

      expect(collection1.equals(collection2)).toBe(false);
    });
  });
});
