import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Group } from '@prisma/client';

export interface Card {
  id: string;
  front: string;
  back: string;
  status: 'UNLEARNED' | 'MASTERED' | 'STRUGGLING';
  order: number;
  favorite: boolean;
}

export interface Deck {
  id: string;
  title: string;
  description: string | null;
  cardCount: number;
  createdAt: Date;
  updatedAt: Date;
  userId: string;
  groups?: Group[];
  shareCode?: string | null;
  progress: number;
  lastStudied: Date | null;
  cards?: Card[];
}

interface DeckState {
  decks: Deck[];
  isLoading: boolean;
  error: string | null;
  filter: 'all' | 'inProgress' | 'completed' | 'notStarted';
  sort: 'recent' | 'alphabetical' | 'cardCount';
  selectedDeck: Deck | null;
}

const initialState: DeckState = {
  decks: [],
  isLoading: true,
  error: null,
  filter: 'all',
  sort: 'recent',
  selectedDeck: null,
};

const deckSlice = createSlice({
  name: 'deck',
  initialState,
  reducers: {
    setDecks: (state, action: PayloadAction<Deck[]>) => {
      state.decks = action.payload;
      state.isLoading = false;
      state.error = null;
    },
    addDeck: (state, action: PayloadAction<Deck>) => {
      state.decks.push(action.payload);
    },
    updateDeck: (state, action: PayloadAction<Deck>) => {
      const index = state.decks.findIndex(
        (deck) => deck.id === action.payload.id,
      );
      if (index !== -1) {
        state.decks[index] = action.payload;
      }
      if (state.selectedDeck?.id === action.payload.id) {
        state.selectedDeck = action.payload;
      }
    },
    deleteDeck: (state, action: PayloadAction<string>) => {
      state.decks = state.decks.filter((deck) => deck.id !== action.payload);
      if (state.selectedDeck?.id === action.payload) {
        state.selectedDeck = null;
      }
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
      state.isLoading = false;
    },
    setFilter: (state, action: PayloadAction<DeckState['filter']>) => {
      state.filter = action.payload;
    },
    setSort: (state, action: PayloadAction<DeckState['sort']>) => {
      state.sort = action.payload;
    },
    setSelectedDeck: (state, action: PayloadAction<Deck | null>) => {
      state.selectedDeck = action.payload;
    },
    updateDeckProgress: (
      state,
      action: PayloadAction<{ deckId: string; progress: number }>,
    ) => {
      const deck = state.decks.find((d) => d.id === action.payload.deckId);
      if (deck) {
        deck.progress = action.payload.progress;
        deck.lastStudied = new Date();
      }
      if (state.selectedDeck?.id === action.payload.deckId) {
        state.selectedDeck.progress = action.payload.progress;
        state.selectedDeck.lastStudied = new Date();
      }
    },
  },
});

export const {
  setDecks,
  addDeck,
  updateDeck,
  deleteDeck,
  setLoading,
  setError,
  setFilter,
  setSort,
  setSelectedDeck,
  updateDeckProgress,
} = deckSlice.actions;

export default deckSlice.reducer;
