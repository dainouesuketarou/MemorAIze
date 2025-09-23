import {
  StudyPurposeValue,
  StudyPurpose,
} from '../../../domain/value-object/study-purpose';
import { StudyPurposeCollection } from '../../../domain/value-object/study-purpose';

describe('StudyPurposeValue Value Object', () => {
  describe('create', () => {
    it('should create a valid study purpose', () => {
      const purpose = StudyPurposeValue.create(StudyPurpose.QUALIFICATION);

      expect(purpose.value).toBe(StudyPurpose.QUALIFICATION);
    });

    it('should throw error for invalid study purpose', () => {
      expect(() => {
        StudyPurposeValue.create('INVALID' as any);
      }).toThrow('Invalid study purpose.');
    });
  });

  describe('factory methods', () => {
    it('should create qualification purpose', () => {
      const purpose = StudyPurposeValue.qualification();

      expect(purpose.value).toBe(StudyPurpose.QUALIFICATION);
    });

    it('should create school exam purpose', () => {
      const purpose = StudyPurposeValue.schoolExam();

      expect(purpose.value).toBe(StudyPurpose.SCHOOL_EXAM);
    });

    it('should create quiz training purpose', () => {
      const purpose = StudyPurposeValue.quizTraining();

      expect(purpose.value).toBe(StudyPurpose.QUIZ_TRAINING);
    });

    it('should create language learning purpose', () => {
      const purpose = StudyPurposeValue.languageLearning();

      expect(purpose.value).toBe(StudyPurpose.LANGUAGE_LEARNING);
    });

    it('should create other purpose', () => {
      const purpose = StudyPurposeValue.other();

      expect(purpose.value).toBe(StudyPurpose.OTHER);
    });
  });

  describe('equals', () => {
    it('should return true for equal purposes', () => {
      const purpose1 = StudyPurposeValue.qualification();
      const purpose2 = StudyPurposeValue.qualification();

      expect(purpose1.equals(purpose2)).toBe(true);
    });

    it('should return false for different purposes', () => {
      const purpose1 = StudyPurposeValue.qualification();
      const purpose2 = StudyPurposeValue.schoolExam();

      expect(purpose1.equals(purpose2)).toBe(false);
    });
  });

  describe('toString', () => {
    it('should return purpose as string', () => {
      const purpose = StudyPurposeValue.languageLearning();

      expect(purpose.toString()).toBe(StudyPurpose.LANGUAGE_LEARNING);
    });
  });

  describe('getDisplayName', () => {
    it('should return Japanese display name for qualification', () => {
      const purpose = StudyPurposeValue.qualification();

      expect(purpose.getDisplayName()).toBe('資格対策');
    });

    it('should return Japanese display name for school exam', () => {
      const purpose = StudyPurposeValue.schoolExam();

      expect(purpose.getDisplayName()).toBe('学校の試験対策');
    });

    it('should return Japanese display name for quiz training', () => {
      const purpose = StudyPurposeValue.quizTraining();

      expect(purpose.getDisplayName()).toBe('クイズトレーニング');
    });

    it('should return Japanese display name for language learning', () => {
      const purpose = StudyPurposeValue.languageLearning();

      expect(purpose.getDisplayName()).toBe('語学学習');
    });

    it('should return Japanese display name for other', () => {
      const purpose = StudyPurposeValue.other();

      expect(purpose.getDisplayName()).toBe('その他');
    });
  });
});

describe('StudyPurposeCollection', () => {
  describe('empty', () => {
    it('should create empty collection', () => {
      const collection = StudyPurposeCollection.empty();

      expect(collection.isEmpty()).toBe(true);
      expect(collection.size()).toBe(0);
      expect(collection.values).toEqual([]);
    });
  });

  describe('fromArray', () => {
    it('should create collection from array', () => {
      const collection = StudyPurposeCollection.fromArray([
        StudyPurpose.QUALIFICATION,
        StudyPurpose.LANGUAGE_LEARNING,
      ]);

      expect(collection.size()).toBe(2);
      expect(collection.values).toEqual([
        StudyPurpose.QUALIFICATION,
        StudyPurpose.LANGUAGE_LEARNING,
      ]);
    });

    it('should create empty collection from empty array', () => {
      const collection = StudyPurposeCollection.fromArray([]);

      expect(collection.isEmpty()).toBe(true);
      expect(collection.size()).toBe(0);
    });
  });

  describe('fromPersistence', () => {
    it('should create collection from persistence data', () => {
      const collection = StudyPurposeCollection.fromPersistence([
        StudyPurpose.SCHOOL_EXAM,
        StudyPurpose.QUIZ_TRAINING,
      ]);

      expect(collection.size()).toBe(2);
      expect(collection.values).toEqual([
        StudyPurpose.SCHOOL_EXAM,
        StudyPurpose.QUIZ_TRAINING,
      ]);
    });
  });

  describe('has', () => {
    it('should check if purpose exists in collection', () => {
      const collection = StudyPurposeCollection.fromArray([
        StudyPurpose.QUALIFICATION,
        StudyPurpose.LANGUAGE_LEARNING,
      ]);

      expect(collection.has(StudyPurpose.QUALIFICATION)).toBe(true);
      expect(collection.has(StudyPurpose.LANGUAGE_LEARNING)).toBe(true);
      expect(collection.has(StudyPurpose.SCHOOL_EXAM)).toBe(false);
    });
  });

  describe('add', () => {
    it('should add purpose to collection', () => {
      const collection = StudyPurposeCollection.empty();

      const newCollection = collection.add(StudyPurpose.QUALIFICATION);
      expect(newCollection.size()).toBe(1);
      expect(newCollection.values).toEqual([StudyPurpose.QUALIFICATION]);

      const newerCollection = newCollection.add(StudyPurpose.LANGUAGE_LEARNING);
      expect(newerCollection.size()).toBe(2);
      expect(newerCollection.values).toEqual([
        StudyPurpose.QUALIFICATION,
        StudyPurpose.LANGUAGE_LEARNING,
      ]);
    });

    it('should not add duplicate purpose', () => {
      const collection = StudyPurposeCollection.fromSingle(
        StudyPurpose.QUALIFICATION,
      );

      const newCollection = collection.add(StudyPurpose.QUALIFICATION);
      expect(newCollection.size()).toBe(1);
      expect(newCollection.values).toEqual([StudyPurpose.QUALIFICATION]);
    });
  });

  describe('remove', () => {
    it('should remove purpose from collection', () => {
      const collection = StudyPurposeCollection.fromArray([
        StudyPurpose.QUALIFICATION,
        StudyPurpose.SCHOOL_EXAM,
        StudyPurpose.LANGUAGE_LEARNING,
      ]);

      const newCollection = collection.remove(StudyPurpose.SCHOOL_EXAM);
      expect(newCollection.size()).toBe(2);
      expect(newCollection.values).toEqual([
        StudyPurpose.QUALIFICATION,
        StudyPurpose.LANGUAGE_LEARNING,
      ]);
    });

    it('should return same collection when removing non-existent purpose', () => {
      const collection = StudyPurposeCollection.fromSingle(
        StudyPurpose.QUALIFICATION,
      );

      const newCollection = collection.remove(StudyPurpose.SCHOOL_EXAM);
      expect(newCollection.size()).toBe(1);
      expect(newCollection.values).toEqual([StudyPurpose.QUALIFICATION]);
    });
  });

  describe('isEmpty', () => {
    it('should return true for empty collection', () => {
      const collection = StudyPurposeCollection.empty();

      expect(collection.isEmpty()).toBe(true);
    });

    it('should return false for non-empty collection', () => {
      const collection = StudyPurposeCollection.fromSingle(
        StudyPurpose.QUALIFICATION,
      );

      expect(collection.isEmpty()).toBe(false);
    });
  });

  describe('size', () => {
    it('should return correct size', () => {
      const collection1 = StudyPurposeCollection.empty();
      expect(collection1.size()).toBe(0);

      const collection2 = StudyPurposeCollection.fromSingle(
        StudyPurpose.QUALIFICATION,
      );
      expect(collection2.size()).toBe(1);

      const collection3 = StudyPurposeCollection.fromArray([
        StudyPurpose.QUALIFICATION,
        StudyPurpose.SCHOOL_EXAM,
        StudyPurpose.LANGUAGE_LEARNING,
      ]);
      expect(collection3.size()).toBe(3);
    });
  });

  describe('equals', () => {
    it('should return true for equal collections', () => {
      const collection1 = StudyPurposeCollection.fromArray([
        StudyPurpose.QUALIFICATION,
        StudyPurpose.LANGUAGE_LEARNING,
      ]);
      const collection2 = StudyPurposeCollection.fromArray([
        StudyPurpose.QUALIFICATION,
        StudyPurpose.LANGUAGE_LEARNING,
      ]);

      expect(collection1.equals(collection2)).toBe(true);
    });

    it('should return false for different collections', () => {
      const collection1 = StudyPurposeCollection.fromSingle(
        StudyPurpose.QUALIFICATION,
      );
      const collection2 = StudyPurposeCollection.fromSingle(
        StudyPurpose.SCHOOL_EXAM,
      );

      expect(collection1.equals(collection2)).toBe(false);
    });

    it('should return false for collections with different sizes', () => {
      const collection1 = StudyPurposeCollection.fromSingle(
        StudyPurpose.QUALIFICATION,
      );
      const collection2 = StudyPurposeCollection.fromArray([
        StudyPurpose.QUALIFICATION,
        StudyPurpose.LANGUAGE_LEARNING,
      ]);

      expect(collection1.equals(collection2)).toBe(false);
    });
  });
});
