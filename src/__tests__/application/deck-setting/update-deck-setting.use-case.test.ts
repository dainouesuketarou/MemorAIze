import { UpdateDeckSettingUseCase } from '../../../application/deck-setting/update-deck-setting.use-case';
import { IDeckSettingRepository } from '../../../domain/repository/deck-setting';
import { DeckSetting } from '../../../domain/entity/deck-setting';

// Mock nanoid
jest.mock('nanoid', () => ({
  nanoid: jest.fn(() => 'mocked-id'),
}));

// Mock repository
const mockDeckSettingRepository: jest.Mocked<IDeckSettingRepository> = {
  generateId: jest.fn(),
  findById: jest.fn(),
  findByUserIdAndDeckId: jest.fn(),
  findByUserId: jest.fn(),
  save: jest.fn(),
  delete: jest.fn(),
  deleteByDeckId: jest.fn(),
};

describe('UpdateDeckSettingUseCase', () => {
  let updateDeckSettingUseCase: UpdateDeckSettingUseCase;

  beforeEach(() => {
    jest.clearAllMocks();
    updateDeckSettingUseCase = new UpdateDeckSettingUseCase(
      mockDeckSettingRepository,
    );
  });

  describe('execute', () => {
    it('should successfully update existing deck setting', async () => {
      // Arrange
      const existingDeckSetting = DeckSetting.create(
        'user-123',
        'deck-123',
        'setting-123',
      );
      mockDeckSettingRepository.findByUserIdAndDeckId.mockResolvedValue(
        existingDeckSetting,
      );
      mockDeckSettingRepository.save.mockResolvedValue();

      const request = {
        userId: 'user-123',
        deckId: 'deck-123',
        autoSpeak: true,
        reverse: true,
        shuffle: false,
        filterMode: ['UNLEARNED', 'MASTERED'] as any,
      };

      // Act
      const result = await updateDeckSettingUseCase.execute(request);

      // Assert
      expect(result.success).toBe(true);
      expect(result.deckSetting).toBeInstanceOf(DeckSetting);
      expect(result.deckSetting!.autoSpeak).toBe(true);
      expect(result.deckSetting!.reverse).toBe(true);
      expect(result.deckSetting!.shuffle).toBe(false);
      expect(result.deckSetting!.filterMode.values).toEqual([
        'UNLEARNED',
        'MASTERED',
      ]);
      expect(mockDeckSettingRepository.save).toHaveBeenCalledWith(
        result.deckSetting,
      );
    });

    it('should create new deck setting when not exists', async () => {
      // Arrange
      mockDeckSettingRepository.findByUserIdAndDeckId.mockResolvedValue(null);
      mockDeckSettingRepository.generateId.mockResolvedValue('setting-123');
      mockDeckSettingRepository.save.mockResolvedValue();

      const request = {
        userId: 'user-123',
        deckId: 'deck-123',
        autoSpeak: true,
      };

      // Act
      const result = await updateDeckSettingUseCase.execute(request);

      // Assert
      expect(result.success).toBe(true);
      expect(result.deckSetting).toBeInstanceOf(DeckSetting);
      expect(result.deckSetting!.userId).toBe('user-123');
      expect(result.deckSetting!.deckId).toBe('deck-123');
      expect(result.deckSetting!.autoSpeak).toBe(true);
      expect(mockDeckSettingRepository.save).toHaveBeenCalledWith(
        result.deckSetting,
      );
    });

    it('should update only specified fields', async () => {
      // Arrange
      const existingDeckSetting = DeckSetting.create(
        'user-123',
        'deck-123',
        'setting-123',
      );
      existingDeckSetting.setAutoSpeak(true);
      existingDeckSetting.setReverse(false);
      mockDeckSettingRepository.findByUserIdAndDeckId.mockResolvedValue(
        existingDeckSetting,
      );
      mockDeckSettingRepository.save.mockResolvedValue();

      const request = {
        userId: 'user-123',
        deckId: 'deck-123',
        shuffle: true,
      };

      // Act
      const result = await updateDeckSettingUseCase.execute(request);

      // Assert
      expect(result.success).toBe(true);
      expect(result.deckSetting!.autoSpeak).toBe(true); // 既存の値が保持される
      expect(result.deckSetting!.reverse).toBe(false); // 既存の値が保持される
      expect(result.deckSetting!.shuffle).toBe(true); // 新しい値が設定される
    });

    it('should handle repository errors during save', async () => {
      // Arrange
      mockDeckSettingRepository.findByUserIdAndDeckId.mockResolvedValue(null);
      mockDeckSettingRepository.generateId.mockResolvedValue('setting-123');
      mockDeckSettingRepository.save.mockRejectedValue(
        new Error('Database error'),
      );

      const request = {
        userId: 'user-123',
        deckId: 'deck-123',
        autoSpeak: true,
      };

      // Act
      const result = await updateDeckSettingUseCase.execute(request);

      // Assert
      expect(result.success).toBe(false);
      expect(result.error).toBe('Database error');
    });

    it('should handle unknown errors', async () => {
      // Arrange
      mockDeckSettingRepository.findByUserIdAndDeckId.mockRejectedValue(
        'Unknown error',
      );

      const request = {
        userId: 'user-123',
        deckId: 'deck-123',
        autoSpeak: true,
      };

      // Act
      const result = await updateDeckSettingUseCase.execute(request);

      // Assert
      expect(result.success).toBe(false);
      expect(result.error).toBe('デッキ設定の更新に失敗しました');
    });
  });
});
