import { Group } from '../../../domain/entity/group';

// Mock nanoid
jest.mock('nanoid', () => ({
  nanoid: jest.fn(() => 'mocked-id'),
}));

describe('Group Entity', () => {
  describe('create', () => {
    it('should create a new group with valid data', () => {
      const group = Group.create(
        {
          name: 'Programming Languages',
          description: 'Study programming languages',
          userId: 'user-123',
        },
        'group-123',
      );

      expect(group.id).toBe('group-123');
      expect(group.name).toBe('Programming Languages');
      expect(group.description).toBe('Study programming languages');
      expect(group.userId).toBe('user-123');
      expect(group.deckIds).toEqual([]);
    });

    it('should create a group without description', () => {
      const group = Group.create(
        {
          name: 'Math',
          userId: 'user-123',
        },
        'group-456',
      );

      expect(group.id).toBe('group-456');
      expect(group.name).toBe('Math');
      expect(group.description).toBeNull();
      expect(group.userId).toBe('user-123');
    });

    it('should trim whitespace from name', () => {
      const group = Group.create(
        {
          name: '  Science  ',
          userId: 'user-123',
        },
        'group-789',
      );

      expect(group.name).toBe('Science');
    });

    it('should throw error for empty name', () => {
      expect(() => {
        Group.create(
          {
            name: '',
            userId: 'user-123',
          },
          'group-123',
        );
      }).toThrow('Group name cannot be empty.');
    });

    it('should throw error for whitespace-only name', () => {
      expect(() => {
        Group.create(
          {
            name: '   ',
            userId: 'user-123',
          },
          'group-123',
        );
      }).toThrow('Group name cannot be empty.');
    });
  });

  describe('fromPersistence', () => {
    it('should create a group from persistence data', () => {
      const group = Group.fromPersistence({
        id: 'group-123',
        name: 'History',
        description: 'Study history',
        userId: 'user-456',
        deckIds: ['deck-1', 'deck-2'],
      });

      expect(group.id).toBe('group-123');
      expect(group.name).toBe('History');
      expect(group.description).toBe('Study history');
      expect(group.userId).toBe('user-456');
      expect(group.deckIds).toEqual(['deck-1', 'deck-2']);
    });
  });

  describe('changeName', () => {
    it('should change group name', () => {
      const group = Group.create(
        {
          name: 'Original Name',
          userId: 'user-123',
        },
        'group-123',
      );

      group.changeName('New Name');
      expect(group.name).toBe('New Name');
    });

    it('should trim whitespace from new name', () => {
      const group = Group.create(
        {
          name: 'Original Name',
          userId: 'user-123',
        },
        'group-123',
      );

      group.changeName('  New Name  ');
      expect(group.name).toBe('New Name');
    });

    it('should throw error for empty new name', () => {
      const group = Group.create(
        {
          name: 'Original Name',
          userId: 'user-123',
        },
        'group-123',
      );

      expect(() => {
        group.changeName('');
      }).toThrow('Group name cannot be empty.');
    });
  });

  describe('changeDescription', () => {
    it('should change group description', () => {
      const group = Group.create(
        {
          name: 'Test Group',
          userId: 'user-123',
        },
        'group-123',
      );

      group.changeDescription('New description');
      expect(group.description).toBe('New description');
    });

    it('should set description to null', () => {
      const group = Group.create(
        {
          name: 'Test Group',
          description: 'Original description',
          userId: 'user-123',
        },
        'group-123',
      );

      group.changeDescription(null);
      expect(group.description).toBeNull();
    });
  });

  describe('addDeck', () => {
    it('should add a deck to the group', () => {
      const group = Group.create(
        {
          name: 'Test Group',
          userId: 'user-123',
        },
        'group-123',
      );

      group.addDeck('deck-1');
      expect(group.deckIds).toEqual(['deck-1']);

      group.addDeck('deck-2');
      expect(group.deckIds).toEqual(['deck-1', 'deck-2']);
    });

    it('should not add duplicate deck', () => {
      const group = Group.create(
        {
          name: 'Test Group',
          userId: 'user-123',
        },
        'group-123',
      );

      group.addDeck('deck-1');
      group.addDeck('deck-1'); // Duplicate
      expect(group.deckIds).toEqual(['deck-1']);
    });
  });

  describe('removeDeck', () => {
    it('should remove a deck from the group', () => {
      const group = Group.fromPersistence({
        id: 'group-123',
        name: 'Test Group',
        description: null,
        userId: 'user-123',
        deckIds: ['deck-1', 'deck-2', 'deck-3'],
      });

      group.removeDeck('deck-2');
      expect(group.deckIds).toEqual(['deck-1', 'deck-3']);
    });

    it('should not throw error when removing non-existent deck', () => {
      const group = Group.fromPersistence({
        id: 'group-123',
        name: 'Test Group',
        description: null,
        userId: 'user-123',
        deckIds: ['deck-1', 'deck-2'],
      });

      expect(() => {
        group.removeDeck('deck-3');
      }).not.toThrow();
      expect(group.deckIds).toEqual(['deck-1', 'deck-2']);
    });
  });

  describe('hasDeck', () => {
    it('should return true if deck exists in group', () => {
      const group = Group.fromPersistence({
        id: 'group-123',
        name: 'Test Group',
        description: null,
        userId: 'user-123',
        deckIds: ['deck-1', 'deck-2'],
      });

      expect(group.hasDeck('deck-1')).toBe(true);
      expect(group.hasDeck('deck-2')).toBe(true);
    });

    it('should return false if deck does not exist in group', () => {
      const group = Group.fromPersistence({
        id: 'group-123',
        name: 'Test Group',
        description: null,
        userId: 'user-123',
        deckIds: ['deck-1', 'deck-2'],
      });

      expect(group.hasDeck('deck-3')).toBe(false);
    });
  });
});
