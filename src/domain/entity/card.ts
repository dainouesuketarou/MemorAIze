import { CardStatusValue, CardStatusType } from '../value-object/card-status';

export type CardId = string;

export interface CardProps {
  id: CardId;
  front: string;
  back: string;
  order: number;
  status: CardStatusValue;
  isFavorite: boolean;
}

export class Card {
  private readonly _id: CardId;
  private _front: string;
  private _back: string;
  private _order: number;
  private _status: CardStatusValue;
  private _isFavorite: boolean;

  private constructor(props: CardProps) {
    this._id = props.id;
    this._front = props.front;
    this._back = props.back;
    this._order = props.order;
    this._status = props.status;
    this._isFavorite = props.isFavorite;
  }

  public static create(
    props: Omit<CardProps, 'id' | 'status' | 'isFavorite'>,
    id: CardId,
  ): Card {
    return new Card({
      ...props,
      id,
      status: CardStatusValue.unlearned(),
      isFavorite: false,
    });
  }

  public static fromPersistence(props: CardProps): Card {
    return new Card(props);
  }

  get id(): CardId {
    return this._id;
  }

  get front(): string {
    return this._front;
  }

  get back(): string {
    return this._back;
  }

  get order(): number {
    return this._order;
  }

  get status(): CardStatusValue {
    return this._status;
  }

  get isFavorite(): boolean {
    return this._isFavorite;
  }

  public updateContent(data: { front?: string; back?: string }) {
    if (data.front) {
      this._front = data.front;
    }
    if (data.back) {
      this._back = data.back;
    }
  }

  public changeStatus(newStatus: CardStatusValue) {
    this._status = newStatus;
  }

  public toggleFavorite() {
    this._isFavorite = !this._isFavorite;
  }

  public changeOrder(newOrder: number) {
    this._order = newOrder;
  }
}
