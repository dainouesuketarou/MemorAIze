import { ILoginHistoryRepository } from '../../../domain/repository/login-history';
import {
  LoginHistory,
  LoginHistoryId,
} from '../../../domain/entity/login-history';
import { UserId } from '../../../domain/entity/user';
import { prisma } from '../prisma.client';
import { nanoid } from 'nanoid';

export class LoginHistoryPrismaRepository implements ILoginHistoryRepository {
  async generateId(): Promise<LoginHistoryId> {
    return nanoid();
  }

  async findById(id: LoginHistoryId): Promise<LoginHistory | null> {
    const loginHistoryData = await prisma.loginHistory.findUnique({
      where: { id },
    });

    if (!loginHistoryData) {
      return null;
    }

    return this.toDomainEntity(loginHistoryData);
  }

  async findByUserId(userId: UserId): Promise<LoginHistory[]> {
    const loginHistoriesData = await prisma.loginHistory.findMany({
      where: { userId },
      orderBy: { loginAt: 'desc' },
    });

    return loginHistoriesData.map((loginHistoryData) =>
      this.toDomainEntity(loginHistoryData),
    );
  }

  async findLatestByUserId(userId: UserId): Promise<LoginHistory | null> {
    const loginHistoryData = await prisma.loginHistory.findFirst({
      where: { userId },
      orderBy: { loginAt: 'desc' },
    });

    if (!loginHistoryData) {
      return null;
    }

    return this.toDomainEntity(loginHistoryData);
  }

  async findByUserIdAndDateRange(
    userId: UserId,
    startDate: Date,
    endDate: Date,
  ): Promise<LoginHistory[]> {
    const loginHistoriesData = await prisma.loginHistory.findMany({
      where: {
        userId,
        loginAt: {
          gte: startDate,
          lte: endDate,
        },
      },
      orderBy: { loginAt: 'desc' },
    });

    return loginHistoriesData.map((loginHistoryData) =>
      this.toDomainEntity(loginHistoryData),
    );
  }

  async findLatestByUserIdWithLimit(
    userId: UserId,
    limit: number,
  ): Promise<LoginHistory[]> {
    const loginHistoriesData = await prisma.loginHistory.findMany({
      where: { userId },
      orderBy: { loginAt: 'desc' },
      take: limit,
    });

    return loginHistoriesData.map((loginHistoryData) =>
      this.toDomainEntity(loginHistoryData),
    );
  }

  async save(loginHistory: LoginHistory): Promise<void> {
    const loginHistoryData = this.toPersistenceData(loginHistory);

    await prisma.loginHistory.create({
      data: loginHistoryData,
    });
  }

  async delete(id: LoginHistoryId): Promise<void> {
    await prisma.loginHistory.delete({
      where: { id },
    });
  }

  private toDomainEntity(loginHistoryData: any): LoginHistory {
    return LoginHistory.fromPersistence({
      id: loginHistoryData.id,
      userId: loginHistoryData.userId,
      loginAt: loginHistoryData.loginAt,
      createdAt: loginHistoryData.createdAt,
    });
  }

  private toPersistenceData(loginHistory: LoginHistory) {
    return {
      id: loginHistory.id,
      userId: loginHistory.userId,
      loginAt: loginHistory.loginAt,
      createdAt: loginHistory.createdAt,
    };
  }
}
