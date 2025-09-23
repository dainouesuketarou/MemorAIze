import { ISubscriptionRepository } from '../../../domain/repository/subscription';
import {
  Subscription,
  SubscriptionId,
} from '../../../domain/entity/subscription';
import { UserId } from '../../../domain/entity/user';
import { SubscriptionPlanValue } from '../../../domain/value-object/subscription-plan';
import { SubscriptionStatusValue } from '../../../domain/value-object/subscription-status';
import { prisma } from '../prisma.client';
import { nanoid } from 'nanoid';

export class SubscriptionPrismaRepository implements ISubscriptionRepository {
  async generateId(): Promise<SubscriptionId> {
    return nanoid();
  }

  async findById(id: SubscriptionId): Promise<Subscription | null> {
    const subscriptionData = await prisma.subscription.findUnique({
      where: { id },
    });

    if (!subscriptionData) {
      return null;
    }

    return this.toDomainEntity(subscriptionData);
  }

  async findByUserId(userId: UserId): Promise<Subscription | null> {
    const subscriptionData = await prisma.subscription.findUnique({
      where: { userId },
    });

    if (!subscriptionData) {
      return null;
    }

    return this.toDomainEntity(subscriptionData);
  }

  async findByStripeSubscriptionId(
    stripeSubscriptionId: string,
  ): Promise<Subscription | null> {
    const subscriptionData = await prisma.subscription.findUnique({
      where: { stripeSubscriptionId },
    });

    if (!subscriptionData) {
      return null;
    }

    return this.toDomainEntity(subscriptionData);
  }

  async save(subscription: Subscription): Promise<void> {
    const subscriptionData = this.toPersistenceData(subscription);

    await prisma.subscription.upsert({
      where: { id: subscription.id },
      create: subscriptionData,
      update: {
        stripeSubscriptionId: subscriptionData.stripeSubscriptionId,
        stripePriceId: subscriptionData.stripePriceId,
        stripeCurrentPeriodEnd: subscriptionData.stripeCurrentPeriodEnd,
        plan: subscriptionData.plan,
        status: subscriptionData.status,
        cancelAtPeriodEnd: subscriptionData.cancelAtPeriodEnd,
        updatedAt: subscriptionData.updatedAt,
      },
    });
  }

  async delete(id: SubscriptionId): Promise<void> {
    await prisma.subscription.delete({
      where: { id },
    });
  }

  private toDomainEntity(subscriptionData: any): Subscription {
    return Subscription.fromPersistence({
      id: subscriptionData.id,
      userId: subscriptionData.userId,
      stripeSubscriptionId: subscriptionData.stripeSubscriptionId,
      stripePriceId: subscriptionData.stripePriceId,
      stripeCurrentPeriodEnd: subscriptionData.stripeCurrentPeriodEnd,
      plan: SubscriptionPlanValue.create(subscriptionData.plan),
      status: SubscriptionStatusValue.create(subscriptionData.status),
      cancelAtPeriodEnd: subscriptionData.cancelAtPeriodEnd,
      createdAt: subscriptionData.createdAt,
      updatedAt: subscriptionData.updatedAt,
    });
  }

  private toPersistenceData(subscription: Subscription) {
    return {
      id: subscription.id,
      userId: subscription.userId,
      stripeSubscriptionId: subscription.stripeSubscriptionId,
      stripePriceId: subscription.stripePriceId,
      stripeCurrentPeriodEnd: subscription.stripeCurrentPeriodEnd,
      plan: subscription.plan.value,
      status: subscription.status.value,
      cancelAtPeriodEnd: subscription.cancelAtPeriodEnd,
      createdAt: subscription.createdAt,
      updatedAt: subscription.updatedAt,
    };
  }
}
