import { IStudyHistoryRepository } from '../../../domain/repository/study-history';
import {
  StudyHistory,
  StudyHistoryId,
} from '../../../domain/entity/study-history';
import { DeckId } from '../../../domain/entity/deck';
import { prisma } from '../prisma.client';
import { nanoid } from 'nanoid';

export class StudyHistoryPrismaRepository implements IStudyHistoryRepository {
  async generateId(): Promise<StudyHistoryId> {
    return nanoid();
  }

  async findById(id: StudyHistoryId): Promise<StudyHistory | null> {
    const studyHistoryData = await prisma.studyHistory.findUnique({
      where: { id },
    });

    if (!studyHistoryData) {
      return null;
    }

    return this.toDomainEntity(studyHistoryData);
  }

  async findByDeckId(deckId: DeckId): Promise<StudyHistory[]> {
    const studyHistoriesData = await prisma.studyHistory.findMany({
      where: { deckId },
      orderBy: { createdAt: 'desc' },
    });

    return studyHistoriesData.map((studyHistoryData) =>
      this.toDomainEntity(studyHistoryData),
    );
  }

  async findLatestByDeckId(deckId: DeckId): Promise<StudyHistory | null> {
    const studyHistoryData = await prisma.studyHistory.findFirst({
      where: { deckId },
      orderBy: { createdAt: 'desc' },
    });

    if (!studyHistoryData) {
      return null;
    }

    return this.toDomainEntity(studyHistoryData);
  }

  async findByDeckIdAndDateRange(
    deckId: DeckId,
    startDate: Date,
    endDate: Date,
  ): Promise<StudyHistory[]> {
    const studyHistoriesData = await prisma.studyHistory.findMany({
      where: {
        deckId,
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return studyHistoriesData.map((studyHistoryData) =>
      this.toDomainEntity(studyHistoryData),
    );
  }

  async save(studyHistory: StudyHistory): Promise<void> {
    const studyHistoryData = this.toPersistenceData(studyHistory);

    await prisma.studyHistory.create({
      data: studyHistoryData,
    });
  }

  async delete(id: StudyHistoryId): Promise<void> {
    await prisma.studyHistory.delete({
      where: { id },
    });
  }

  private toDomainEntity(studyHistoryData: any): StudyHistory {
    return StudyHistory.fromPersistence({
      id: studyHistoryData.id,
      deckId: studyHistoryData.deckId,
      progress: studyHistoryData.progress,
      createdAt: studyHistoryData.createdAt,
    });
  }

  private toPersistenceData(studyHistory: StudyHistory) {
    return {
      id: studyHistory.id,
      deckId: studyHistory.deckId,
      progress: studyHistory.progress,
      createdAt: studyHistory.createdAt,
    };
  }

  async deleteByDeckId(deckId: DeckId): Promise<void> {
    await prisma.studyHistory.deleteMany({
      where: {
        deckId,
      },
    });
  }
}
