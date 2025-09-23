import { StudyHistory } from '../../../domain/entity/study-history';

// Mock nanoid
jest.mock('nanoid', () => ({
  nanoid: jest.fn(() => 'mocked-id'),
}));

describe('StudyHistory Entity', () => {
  describe('create', () => {
    it('should create a new study history with valid data', () => {
      const studyHistory = StudyHistory.create('deck-123', 75, 'history-123');

      expect(studyHistory.id).toBe('history-123');
      expect(studyHistory.deckId).toBe('deck-123');
      expect(studyHistory.progress).toBe(75);
      expect(studyHistory.createdAt).toBeInstanceOf(Date);
    });

    it('should create study history with 0 progress', () => {
      const studyHistory = StudyHistory.create('deck-123', 0, 'history-123');

      expect(studyHistory.progress).toBe(0);
    });

    it('should create study history with 100 progress', () => {
      const studyHistory = StudyHistory.create('deck-123', 100, 'history-123');

      expect(studyHistory.progress).toBe(100);
    });

    it('should throw error for negative progress', () => {
      expect(() => {
        StudyHistory.create('deck-123', -1, 'history-123');
      }).toThrow('Progress must be between 0 and 100.');
    });

    it('should throw error for progress over 100', () => {
      expect(() => {
        StudyHistory.create('deck-123', 101, 'history-123');
      }).toThrow('Progress must be between 0 and 100.');
    });
  });

  describe('fromPersistence', () => {
    it('should create study history from persistence data', () => {
      const createdAt = new Date('2024-01-01T10:00:00Z');
      const studyHistory = StudyHistory.fromPersistence({
        id: 'history-123',
        deckId: 'deck-456',
        progress: 85,
        createdAt,
      });

      expect(studyHistory.id).toBe('history-123');
      expect(studyHistory.deckId).toBe('deck-456');
      expect(studyHistory.progress).toBe(85);
      expect(studyHistory.createdAt).toEqual(createdAt);
    });
  });

  describe('getter properties', () => {
    it('should return correct values', () => {
      const createdAt = new Date('2024-01-01T10:00:00Z');
      const studyHistory = StudyHistory.fromPersistence({
        id: 'history-123',
        deckId: 'deck-456',
        progress: 60,
        createdAt,
      });

      expect(studyHistory.id).toBe('history-123');
      expect(studyHistory.deckId).toBe('deck-456');
      expect(studyHistory.progress).toBe(60);
      expect(studyHistory.createdAt).toEqual(createdAt);
    });
  });
});
