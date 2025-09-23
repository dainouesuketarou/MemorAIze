import { GetDeckSettingUseCase } from '../../../application/deck-setting/get-deck-setting.use-case';
import { IDeckSettingRepository } from '../../../domain/repository/deck-setting';
import { DeckSetting } from '../../../domain/entity/deck-setting';

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

describe('GetDeckSettingUseCase', () => {
  let getDeckSettingUseCase: GetDeckSettingUseCase;

  beforeEach(() => {
    jest.clearAllMocks();
    getDeckSettingUseCase = new GetDeckSettingUseCase(
      mockDeckSettingRepository,
    );
  });

  describe('execute', () => {
    it('should successfully get deck setting', async () => {
      // Arrange
      const deckSetting = DeckSetting.create(
        'user-123',
        'deck-123',
        'setting-123',
      );
      deckSetting.setAutoSpeak(true);
      deckSetting.setShuffle(true);
      mockDeckSettingRepository.findByUserIdAndDeckId.mockResolvedValue(
        deckSetting,
      );

      const request = {
        userId: 'user-123',
        deckId: 'deck-123',
      };

      // Act
      const result = await getDeckSettingUseCase.execute(request);

      // Assert
      expect(result.success).toBe(true);
      expect(result.deckSetting).toBeInstanceOf(DeckSetting);
      expect(result.deckSetting!.userId).toBe('user-123');
      expect(result.deckSetting!.deckId).toBe('deck-123');
      expect(result.deckSetting!.autoSpeak).toBe(true);
      expect(result.deckSetting!.shuffle).toBe(true);
      expect(
        mockDeckSettingRepository.findByUserIdAndDeckId,
      ).toHaveBeenCalledWith('user-123', 'deck-123');
    });

    it('should return undefined when deck setting not found', async () => {
      // Arrange
      mockDeckSettingRepository.findByUserIdAndDeckId.mockResolvedValue(null);

      const request = {
        userId: 'user-123',
        deckId: 'deck-123',
      };

      // Act
      const result = await getDeckSettingUseCase.execute(request);

      // Assert
      expect(result.success).toBe(true);
      expect(result.deckSetting).toBeUndefined();
    });

    it('should handle repository errors', async () => {
      // Arrange
      mockDeckSettingRepository.findByUserIdAndDeckId.mockRejectedValue(
        new Error('Database error'),
      );

      const request = {
        userId: 'user-123',
        deckId: 'deck-123',
      };

      // Act
      const result = await getDeckSettingUseCase.execute(request);

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
      };

      // Act
      const result = await getDeckSettingUseCase.execute(request);

      // Assert
      expect(result.success).toBe(false);
      expect(result.error).toBe('デッキ設定の取得に失敗しました');
    });
  });
});
