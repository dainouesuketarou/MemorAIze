import { Card, CardId } from './card';

export type DeckId = string;
export type UserId = string;

export interface DeckProps {
  id: DeckId;
  userId: UserId;
  title: string;
  description: string | null;
  cards: Card[];
  cardCount: number;
  progress: number;
  lastStudied: Date | null;
  shareCode: string;
  groupIds: string[];
}

export class Deck {
  private readonly _id: DeckId;
  private readonly _userId: UserId;
  private _title: string;
  private _description: string | null;
  private _cards: Card[];
  private _cardCount: number;
  private _progress: number;
  private _lastStudied: Date | null;
  private _shareCode: string;
  private _groupIds: string[];

  private constructor(props: DeckProps) {
    this._id = props.id;
    this._userId = props.userId;
    this._title = props.title;
    this._description = props.description;
    this._cards = props.cards;
    this._cardCount = props.cardCount;
    this._progress = props.progress;
    this._lastStudied = props.lastStudied;
    this._shareCode = props.shareCode;
    this._groupIds = props.groupIds;
  }

  public static create(
    props: Omit<
      DeckProps,
      | 'id'
      | 'cards'
      | 'description'
      | 'cardCount'
      | 'progress'
      | 'lastStudied'
      | 'shareCode'
      | 'groupIds'
    >,
    id: DeckId,
  ): Deck {
    return new Deck({
      ...props,
      id,
      description: null,
      cards: [],
      cardCount: 0,
      progress: 0,
      lastStudied: null,
      shareCode: '',
      groupIds: [],
    });
  }

  public static fromPersistence(props: DeckProps): Deck {
    return new Deck(props);
  }

  get id(): DeckId {
    return this._id;
  }

  get userId(): UserId {
    return this._userId;
  }

  get title(): string {
    return this._title;
  }

  get description(): string | null {
    return this._description;
  }

  get cards(): Card[] {
    return this._cards;
  }

  get cardCount(): number {
    return this._cardCount;
  }

  get progress(): number {
    return this._progress;
  }

  get lastStudied(): Date | null {
    return this._lastStudied;
  }

  get shareCode(): string {
    return this._shareCode;
  }

  get groupIds(): string[] {
    return [...this._groupIds];
  }

  public changeTitle(title: string) {
    if (!title) {
      throw new Error('Title cannot be empty.');
    }
    this._title = title;
  }

  public changeDescription(description: string | null) {
    this._description = description;
  }

  public updateGroupIds(groupIds: string[]) {
    this._groupIds = groupIds;
  }

  public addCard(
    data: { front: string; back: string },
    newCardId: CardId,
  ): Card {
    const newOrder = this._cards.length;
    const newCard = Card.create(
      {
        front: data.front,
        back: data.back,
        order: newOrder,
      },
      newCardId,
    );
    this._cards.push(newCard);
    return newCard;
  }

  public removeCard(cardId: CardId) {
    this._cards = this._cards.filter((card) => card.id !== cardId);
    this.reorderCardsInternal();
  }

  public updateCardContent(
    cardId: CardId,
    data: { front?: string; back?: string },
  ) {
    const card = this.findCardById(cardId);
    card.updateContent(data);
  }

  public reorderCards(orderedCardIds: CardId[]) {
    if (orderedCardIds.length !== this._cards.length) {
      throw new Error('The number of cards does not match.');
    }

    const cardMap = new Map(this._cards.map((card) => [card.id, card]));

    orderedCardIds.forEach((id, index) => {
      const card = cardMap.get(id);
      if (card) {
        card.changeOrder(index);
      }
    });
  }

  public updateProgress() {
    const totalCards = this._cards.length;
    if (totalCards === 0) {
      this._progress = 0;
      return;
    }

    const masteredCount = this._cards.filter((card) =>
      card.status.isMastered(),
    ).length;
    this._progress = masteredCount / totalCards;
  }

  public updateLastStudied() {
    this._lastStudied = new Date();
  }

  private reorderCardsInternal() {
    this._cards.forEach((card, index) => {
      card.changeOrder(index);
    });
  }

  private findCardById(cardId: CardId): Card {
    const card = this._cards.find((c) => c.id === cardId);
    if (!card) {
      throw new Error(`Card with id ${cardId} not found in this deck.`);
    }
    return card;
  }
}
