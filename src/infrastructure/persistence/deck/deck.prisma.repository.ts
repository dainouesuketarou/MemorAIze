import { IDeckRepository } from '../../../domain/repository/deck';
import { Deck, DeckId, UserId } from '../../../domain/entity/deck';
import { Card } from '../../../domain/entity/card';
import { CardStatusValue } from '../../../domain/value-object/card-status';
import { prisma } from '../prisma.client';
import { nanoid } from 'nanoid';

export class DeckPrismaRepository implements IDeckRepository {
  async generateId(): Promise<DeckId> {
    return nanoid();
  }

  async findById(id: DeckId): Promise<Deck | null> {
    const deckData = await prisma.deck.findUnique({
      where: { id },
      include: {
        cards: {
          orderBy: { order: 'asc' },
        },
        groups: true,
      },
    });

    if (!deckData) {
      return null;
    }

    return this.toDomainEntity(deckData);
  }

  async findByUserId(userId: UserId): Promise<Deck[]> {
    const decksData = await prisma.deck.findMany({
      where: { userId },
      include: {
        cards: {
          orderBy: { order: 'asc' },
        },
        groups: true,
      },
      orderBy: { lastStudied: 'desc' },
    });

    return decksData.map((deckData) => this.toDomainEntity(deckData));
  }

  async save(deck: Deck): Promise<void> {
    const deckData = this.toPersistenceData(deck);

    // groupIdsを除外したデータを作成
    const { groupIds, ...deckDataWithoutGroupIds } = deckData;

    await prisma.deck.upsert({
      where: { id: deck.id },
      create: {
        ...deckDataWithoutGroupIds,
        cards: {
          create: deckData.cards,
        },
        groups:
          deckData.groupIds && deckData.groupIds.length > 0
            ? {
                connect: deckData.groupIds.map((id: string) => ({ id })),
              }
            : undefined,
      },
      update: {
        title: deckData.title,
        cardCount: deckData.cardCount,
        progress: deckData.progress,
        lastStudied: deckData.lastStudied,
        cards: {
          deleteMany: {},
          create: deckData.cards,
        },
        groups: {
          set: (deckData.groupIds || []).map((id: string) => ({ id })),
        },
      },
    });
  }

  async delete(id: DeckId): Promise<void> {
    await prisma.deck.delete({
      where: { id },
    });
  }

  private toDomainEntity(deckData: any): Deck {
    const cards = deckData.cards.map((cardData: any) =>
      Card.fromPersistence({
        id: cardData.id,
        front: cardData.front,
        back: cardData.back,
        order: cardData.order,
        status: CardStatusValue.create(cardData.status),
        isFavorite: cardData.favorite,
      }),
    );

    return Deck.fromPersistence({
      id: deckData.id,
      title: deckData.title,
      userId: deckData.userId,
      description: deckData.description,
      cardCount: deckData.cardCount,
      progress: deckData.progress,
      lastStudied: deckData.lastStudied,
      shareCode: deckData.shareCode,
      cards,
      groupIds: deckData.groups?.map((group: any) => group.id) || [],
    });
  }

  private toPersistenceData(deck: Deck) {
    return {
      id: deck.id,
      title: deck.title,
      userId: deck.userId,
      description: deck.description,
      cardCount: deck.cardCount,
      progress: deck.progress,
      lastStudied: deck.lastStudied,
      shareCode: deck.shareCode,
      cards: deck.cards.map((card) => ({
        id: card.id,
        front: card.front,
        back: card.back,
        order: card.order,
        status: card.status.value,
        favorite: card.isFavorite,
      })),
      groupIds: deck.groupIds || [],
    };
  }
}
