import { IAiGenerationLimitRepository } from '../../../domain/repository/ai-generation-limit';
import {
  AiGenerationLimit,
  AiGenerationLimitId,
} from '../../../domain/entity/ai-generation-limit';
import { UserId } from '../../../domain/entity/user';
import { prisma } from '../prisma.client';
import { nanoid } from 'nanoid';

export class AiGenerationLimitPrismaRepository
  implements IAiGenerationLimitRepository
{
  async generateId(): Promise<AiGenerationLimitId> {
    return nanoid();
  }

  async findById(id: AiGenerationLimitId): Promise<AiGenerationLimit | null> {
    const limitData = await prisma.aiGenerationLimit.findUnique({
      where: { id },
    });

    if (!limitData) {
      return null;
    }

    return this.toDomainEntity(limitData);
  }

  async findByUserIdAndMonth(
    userId: UserId,
    month: Date,
  ): Promise<AiGenerationLimit | null> {
    const limitData = await prisma.aiGenerationLimit.findUnique({
      where: {
        userId_month: {
          userId,
          month,
        },
      },
    });

    if (!limitData) {
      return null;
    }

    return this.toDomainEntity(limitData);
  }

  async findByUserId(userId: UserId): Promise<AiGenerationLimit[]> {
    const limitsData = await prisma.aiGenerationLimit.findMany({
      where: { userId },
      orderBy: { month: 'desc' },
    });

    return limitsData.map((limitData) => this.toDomainEntity(limitData));
  }

  async findByUserIdAndDateRange(
    userId: UserId,
    startMonth: Date,
    endMonth: Date,
  ): Promise<AiGenerationLimit[]> {
    const limitsData = await prisma.aiGenerationLimit.findMany({
      where: {
        userId,
        month: {
          gte: startMonth,
          lte: endMonth,
        },
      },
      orderBy: { month: 'desc' },
    });

    return limitsData.map((limitData) => this.toDomainEntity(limitData));
  }

  async save(aiGenerationLimit: AiGenerationLimit): Promise<void> {
    const limitData = this.toPersistenceData(aiGenerationLimit);

    await prisma.aiGenerationLimit.upsert({
      where: {
        userId_month: {
          userId: aiGenerationLimit.userId,
          month: aiGenerationLimit.month,
        },
      },
      create: limitData,
      update: {
        count: limitData.count,
        updatedAt: limitData.updatedAt,
      },
    });
  }

  async delete(id: AiGenerationLimitId): Promise<void> {
    await prisma.aiGenerationLimit.delete({
      where: { id },
    });
  }

  private toDomainEntity(limitData: any): AiGenerationLimit {
    return AiGenerationLimit.fromPersistence({
      id: limitData.id,
      userId: limitData.userId,
      month: limitData.month,
      count: limitData.count,
      createdAt: limitData.createdAt,
      updatedAt: limitData.updatedAt,
    });
  }

  private toPersistenceData(aiGenerationLimit: AiGenerationLimit) {
    return {
      id: aiGenerationLimit.id,
      userId: aiGenerationLimit.userId,
      month: aiGenerationLimit.month,
      count: aiGenerationLimit.count,
      createdAt: aiGenerationLimit.createdAt,
      updatedAt: aiGenerationLimit.updatedAt,
    };
  }
}
