import { IUserRepository } from '../../../domain/repository/user';
import { User, UserId, UserEmail } from '../../../domain/entity/user';
import { StudyPurposeCollection } from '../../../domain/value-object/study-purpose';
import { prisma } from '../prisma.client';
import { nanoid } from 'nanoid';

export class UserPrismaRepository implements IUserRepository {
  async generateId(): Promise<UserId> {
    return nanoid();
  }

  async findById(id: UserId): Promise<User | null> {
    const userData = await prisma.user.findUnique({
      where: { id },
      include: {
        studyPurposes: true,
      },
    });

    if (!userData) {
      return null;
    }

    return this.toDomainEntity(userData);
  }

  async findByEmail(email: UserEmail): Promise<User | null> {
    const userData = await prisma.user.findUnique({
      where: { email },
      include: {
        studyPurposes: true,
      },
    });

    if (!userData) {
      return null;
    }

    return this.toDomainEntity(userData);
  }

  async save(user: User): Promise<void> {
    const userData = this.toPersistenceData(user);

    await prisma.user.upsert({
      where: { id: user.id },
      create: {
        ...userData,
        studyPurposes: {
          create: userData.studyPurposes.map((purpose) => ({ purpose })),
        },
      },
      update: {
        email: userData.email,
        name: userData.name,
        image: userData.image,
        isOnboarded: userData.isOnboarded,
        studyPurposes: {
          deleteMany: {},
          create: userData.studyPurposes.map((purpose) => ({ purpose })),
        },
      },
    });
  }

  async delete(id: UserId): Promise<void> {
    await prisma.user.delete({
      where: { id },
    });
  }

  private toDomainEntity(userData: any): User {
    return User.fromPersistence({
      id: userData.id,
      email: userData.email,
      name: userData.name,
      image: userData.image,
      isOnboarded: userData.isOnboarded,
      studyPurposes: StudyPurposeCollection.fromPersistence(
        userData.studyPurposes?.map((sp: any) => sp.purpose) || [],
      ),
    });
  }

  private toPersistenceData(user: User) {
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      image: user.image,
      isOnboarded: user.isOnboarded,
      studyPurposes: user.studyPurposes.values,
    };
  }
}
