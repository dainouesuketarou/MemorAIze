import { ICardRepository } from '../../../domain/repository/card';
import { Card, CardId } from '../../../domain/entity/card';
import { DeckId } from '../../../domain/entity/deck';
import { CardStatusValue } from '../../../domain/value-object/card-status';
import { prisma } from '../prisma.client';
import { nanoid } from 'nanoid';

export class CardPrismaRepository implements ICardRepository {
  async generateId(): Promise<CardId> {
    return nanoid();
  }

  async findById(id: CardId): Promise<Card | null> {
    const cardData = await prisma.card.findUnique({
      where: { id },
    });

    if (!cardData) {
      return null;
    }

    return this.toDomainEntity(cardData);
  }

  async findByDeckId(deckId: DeckId): Promise<Card[]> {
    const cardsData = await prisma.card.findMany({
      where: { deckId },
      orderBy: { order: 'asc' },
    });

    return cardsData.map((cardData) => this.toDomainEntity(cardData));
  }

  async save(card: Card, deckId: DeckId): Promise<void> {
    const cardData = this.toPersistenceData(card, deckId);

    await prisma.card.upsert({
      where: { id: card.id },
      create: cardData,
      update: {
        front: cardData.front,
        back: cardData.back,
        order: cardData.order,
        status: cardData.status,
        favorite: cardData.favorite,
      },
    });
  }

  async updateOrder(deckId: DeckId, orderedCardIds: CardId[]): Promise<void> {
    await Promise.all(
      orderedCardIds.map((cardId, index) =>
        prisma.card.update({
          where: { id: cardId },
          data: { order: index },
        }),
      ),
    );
  }

  async delete(id: CardId): Promise<void> {
    await prisma.card.delete({
      where: { id },
    });
  }

  private toDomainEntity(cardData: any): Card {
    return Card.fromPersistence({
      id: cardData.id,
      front: cardData.front,
      back: cardData.back,
      order: cardData.order,
      status: CardStatusValue.create(cardData.status),
      isFavorite: cardData.favorite,
    });
  }

  private toPersistenceData(card: Card, deckId: DeckId) {
    return {
      id: card.id,
      front: card.front,
      back: card.back,
      order: card.order,
      status: card.status.value,
      favorite: card.isFavorite,
      deckId,
    };
  }
}
