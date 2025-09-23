import { UserPrismaRepository } from '../../../../infrastructure/persistence/user/user.prisma.repository';
import { User } from '../../../../domain/entity/user';
import { StudyPurposeCollection } from '../../../../domain/value-object/study-purpose';

// Mock Prisma
jest.mock('../../../../infrastructure/persistence/prisma.client', () => ({
  prisma: {
    user: {
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

describe('UserPrismaRepository', () => {
  let userRepository: UserPrismaRepository;
  let mockPrisma: any;

  beforeEach(() => {
    userRepository = new UserPrismaRepository();
    mockPrisma =
      require('../../../../infrastructure/persistence/prisma.client').prisma;
    jest.clearAllMocks();
  });

  describe('generateId', () => {
    it('should generate a new ID', async () => {
      const id = await userRepository.generateId();
      expect(id).toBe('mocked-id');
    });
  });

  describe('findById', () => {
    it('should find user by id', async () => {
      const userData = {
        id: 'user-123',
        email: 'test@example.com',
        name: 'Test User',
        image: 'https://example.com/avatar.jpg',
        isOnboarded: true,
        studyPurposes: [
          { purpose: 'QUALIFICATION' },
          { purpose: 'LANGUAGE_LEARNING' },
        ],
      };
      mockPrisma.user.findUnique.mockResolvedValue(userData);

      const result = await userRepository.findById('user-123');

      expect(result).toBeInstanceOf(User);
      expect(result!.id).toBe('user-123');
      expect(result!.email).toBe('test@example.com');
      expect(result!.studyPurposes.values).toEqual([
        'QUALIFICATION',
        'LANGUAGE_LEARNING',
      ]);
      expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({
        where: { id: 'user-123' },
        include: {
          studyPurposes: true,
        },
      });
    });

    it('should return null when user not found', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);

      const result = await userRepository.findById('non-existent');

      expect(result).toBeNull();
    });
  });

  describe('findByEmail', () => {
    it('should find user by email', async () => {
      const userData = {
        id: 'user-123',
        email: 'test@example.com',
        name: 'Test User',
        image: null,
        isOnboarded: false,
        studyPurposes: [],
      };
      mockPrisma.user.findUnique.mockResolvedValue(userData);

      const result = await userRepository.findByEmail('test@example.com');

      expect(result).toBeInstanceOf(User);
      expect(result!.email).toBe('test@example.com');
      expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({
        where: { email: 'test@example.com' },
        include: {
          studyPurposes: true,
        },
      });
    });
  });

  describe('save', () => {
    it('should create new user', async () => {
      const user = User.create(
        {
          email: 'newuser@example.com',
          name: 'New User',
          image: null,
        },
        'user-123',
      );

      mockPrisma.user.upsert.mockResolvedValue({});

      await userRepository.save(user);

      expect(mockPrisma.user.upsert).toHaveBeenCalledWith({
        where: { id: 'user-123' },
        create: expect.objectContaining({
          id: 'user-123',
          email: 'newuser@example.com',
          name: 'New User',
          image: null,
          isOnboarded: false,
          studyPurposes: {
            create: [],
          },
        }),
        update: expect.objectContaining({
          email: 'newuser@example.com',
          name: 'New User',
          image: null,
          isOnboarded: false,
          studyPurposes: {
            deleteMany: {},
            create: [],
          },
        }),
      });
    });

    it('should update existing user with study purposes', async () => {
      const user = User.create(
        {
          email: 'updated@example.com',
          name: 'Updated User',
          image: 'https://example.com/avatar.jpg',
        },
        'user-123',
      );
      user.completeOnboarding('Updated User', [
        'QUALIFICATION',
        'LANGUAGE_LEARNING',
      ]);

      mockPrisma.user.upsert.mockResolvedValue({});

      await userRepository.save(user);

      expect(mockPrisma.user.upsert).toHaveBeenCalledWith({
        where: { id: 'user-123' },
        create: expect.any(Object),
        update: expect.objectContaining({
          studyPurposes: {
            deleteMany: {},
            create: [
              { purpose: 'QUALIFICATION' },
              { purpose: 'LANGUAGE_LEARNING' },
            ],
          },
        }),
      });
    });
  });

  describe('delete', () => {
    it('should delete user', async () => {
      mockPrisma.user.delete.mockResolvedValue({});

      await userRepository.delete('user-123');

      expect(mockPrisma.user.delete).toHaveBeenCalledWith({
        where: { id: 'user-123' },
      });
    });
  });
});
