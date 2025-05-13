import { Deck, Group, Card } from '@prisma/client';

export type DeckWithCardsAndGroups = Deck & {
  cards: Card[];
  groups: Group[];
}; 