import { IDeckSettingRepository } from '../../../domain/repository/deck-setting';
import {
  DeckSetting,
  DeckSettingId,
} from '../../../domain/entity/deck-setting';
import { UserId } from '../../../domain/entity/user';
import { DeckId } from '../../../domain/entity/deck';
import { FilterModeCollection } from '../../../domain/value-object/filter-mode';
import { prisma } from '../prisma.client';
import { nanoid } from 'nanoid';

export class DeckSettingPrismaRepository implements IDeckSettingRepository {
  async generateId(): Promise<DeckSettingId> {
    return nanoid();
  }

  async findById(id: DeckSettingId): Promise<DeckSetting | null> {
    const deckSettingData = await prisma.deckSetting.findUnique({
      where: { id },
    });

    if (!deckSettingData) {
      return null;
    }

    return this.toDomainEntity(deckSettingData);
  }

  async findByUserIdAndDeckId(
    userId: UserId,
    deckId: DeckId,
  ): Promise<DeckSetting | null> {
    const deckSettingData = await prisma.deckSetting.findUnique({
      where: {
        userId_deckId: {
          userId,
          deckId,
        },
      },
    });

    if (!deckSettingData) {
      return null;
    }

    return this.toDomainEntity(deckSettingData);
  }

  async findByUserId(userId: UserId): Promise<DeckSetting[]> {
    const deckSettingsData = await prisma.deckSetting.findMany({
      where: { userId },
      orderBy: { updatedAt: 'desc' },
    });

    return deckSettingsData.map((deckSettingData) =>
      this.toDomainEntity(deckSettingData),
    );
  }

  async save(deckSetting: DeckSetting): Promise<void> {
    const deckSettingData = this.toPersistenceData(deckSetting);

    await prisma.deckSetting.upsert({
      where: {
        userId_deckId: {
          userId: deckSetting.userId,
          deckId: deckSetting.deckId,
        },
      },
      create: deckSettingData,
      update: {
        autoSpeak: deckSettingData.autoSpeak,
        reverse: deckSettingData.reverse,
        filterMode: deckSettingData.filterMode,
        shuffle: deckSettingData.shuffle,
        updatedAt: deckSettingData.updatedAt,
      },
    });
  }

  async delete(id: DeckSettingId): Promise<void> {
    await prisma.deckSetting.delete({
      where: { id },
    });
  }

  private toDomainEntity(deckSettingData: any): DeckSetting {
    return DeckSetting.fromPersistence({
      id: deckSettingData.id,
      userId: deckSettingData.userId,
      deckId: deckSettingData.deckId,
      autoSpeak: deckSettingData.autoSpeak,
      reverse: deckSettingData.reverse,
      filterMode: FilterModeCollection.fromPersistence(
        deckSettingData.filterMode,
      ),
      shuffle: deckSettingData.shuffle,
      createdAt: deckSettingData.createdAt,
      updatedAt: deckSettingData.updatedAt,
    });
  }

  private toPersistenceData(deckSetting: DeckSetting) {
    return {
      id: deckSetting.id,
      userId: deckSetting.userId,
      deckId: deckSetting.deckId,
      autoSpeak: deckSetting.autoSpeak,
      reverse: deckSetting.reverse,
      filterMode: deckSetting.filterMode.values,
      shuffle: deckSetting.shuffle,
      createdAt: deckSetting.createdAt,
      updatedAt: deckSetting.updatedAt,
    };
  }

  async deleteByDeckId(deckId: DeckId): Promise<void> {
    await prisma.deckSetting.deleteMany({
      where: {
        deckId,
      },
    });
  }
}
