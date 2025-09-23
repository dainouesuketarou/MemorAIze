import {
  createSlice,
  PayloadAction,
  ActionCreatorWithPayload,
  createAsyncThunk,
} from '@reduxjs/toolkit';
import { DeckWithCardsAndGroups, GroupWithDetails } from '@/src/types/deck';

export interface Card {
  id: string;
  front: string;
  back: string;
  status: 'UNLEARNED' | 'MASTERED' | 'STRUGGLING';
  order: number;
  favorite: boolean;
}

interface DeckState {
  decks: DeckWithCardsAndGroups[];
  isLoading: boolean;
  error: string | null;
  filter: 'all' | 'inProgress' | 'completed' | 'notStarted';
  sort: 'recent' | 'alphabetical' | 'cardCount';
  selectedDeck: DeckWithCardsAndGroups | null;
  lastFetched: number | null;
}

const initialState: DeckState = {
  decks: [],
  isLoading: false,
  error: null,
  filter: 'all',
  sort: 'recent',
  selectedDeck: null,
  lastFetched: null,
};

// デッキのフェッチ（必要に応じて）
export const fetchDecksIfNeeded = createAsyncThunk(
  'deck/fetchDecksIfNeeded',
  async (_, { getState, rejectWithValue }) => {
    const state = getState() as { deck: DeckState };
    const { lastFetched } = state.deck;

    // 最後のフェッチから5分経過していない場合はスキップ
    if (lastFetched && Date.now() - lastFetched < 5 * 60 * 1000) {
      return null;
    }

    try {
      const response = await fetch('/api/decks');
      if (!response.ok) {
        throw new Error('デッキ一覧の取得に失敗しました');
      }
      const data = await response.json();
      return data.map((deck: any) => ({
        ...deck,
        cards: deck.cards || [],
        lastStudied: deck.lastStudied ? String(deck.lastStudied) : null,
        groups: deck.groups || [],
      }));
    } catch (error) {
      return rejectWithValue(
        error instanceof Error ? error.message : 'データの取得に失敗しました',
      );
    }
  },
);

// デッキ詳細のフェッチ（必要に応じて）
export const fetchDeckDetailsIfNeeded = createAsyncThunk(
  'deck/fetchDeckDetailsIfNeeded',
  async (deckId: string, { getState, rejectWithValue }) => {
    const state = getState() as { deck: DeckState };
    const { selectedDeck, lastFetched } = state.deck;

    // 最後のフェッチから5分経過していない場合はスキップ
    if (
      selectedDeck?.id === deckId &&
      lastFetched &&
      Date.now() - lastFetched < 5 * 60 * 1000
    ) {
      return null;
    }

    try {
      const response = await fetch(`/api/decks/${deckId}`);
      if (!response.ok) {
        throw new Error('デッキの取得に失敗しました');
      }
      const data = await response.json();
      return {
        ...data,
        cards: data.cards || [],
        lastStudied: data.lastStudied ? String(data.lastStudied) : null,
        groups: data.groups || [],
      };
    } catch (error) {
      return rejectWithValue(
        error instanceof Error ? error.message : 'データの取得に失敗しました',
      );
    }
  },
);

const deckSlice = createSlice({
  name: 'deck',
  initialState,
  reducers: {
    setDecks: (state, action: PayloadAction<DeckWithCardsAndGroups[]>) => {
      state.decks = action.payload;
      state.isLoading = false;
      state.error = null;
    },
    addDeck: (state, action: PayloadAction<DeckWithCardsAndGroups>) => {
      state.decks.push(action.payload);
    },
    updateDeck: (state, action: PayloadAction<DeckWithCardsAndGroups>) => {
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
    setSelectedDeck: (
      state,
      action: PayloadAction<DeckWithCardsAndGroups | null>,
    ) => {
      state.selectedDeck = action.payload;
    },
    updateDeckProgress: (
      state,
      action: PayloadAction<{ deckId: string; progress: number }>,
    ) => {
      const deck = state.decks.find((d) => d.id === action.payload.deckId);
      if (deck) {
        deck.progress = action.payload.progress;
        deck.lastStudied = new Date().toISOString();
      }
      if (state.selectedDeck?.id === action.payload.deckId) {
        state.selectedDeck.progress = action.payload.progress;
        state.selectedDeck.lastStudied = new Date().toISOString();
      }
    },
    deleteCard: (
      state,
      action: PayloadAction<{ deckId: string; cardId: string }>,
    ) => {
      const deck = state.decks.find((d) => d.id === action.payload.deckId);
      if (deck) {
        deck.cards = deck.cards.filter((c) => c.id !== action.payload.cardId);
        deck.cardCount = deck.cards.length;
      }
      if (state.selectedDeck?.id === action.payload.deckId) {
        state.selectedDeck.cards = state.selectedDeck.cards.filter(
          (c) => c.id !== action.payload.cardId,
        );
        state.selectedDeck.cardCount = state.selectedDeck.cards.length;
      }
    },
    updateCardStatus: (
      state,
      action: PayloadAction<{
        deckId: string;
        cardId: string;
        status: 'UNLEARNED' | 'MASTERED' | 'STRUGGLING';
      }>,
    ) => {
      const deck = state.decks.find((d) => d.id === action.payload.deckId);
      if (deck) {
        const card = deck.cards.find((c) => c.id === action.payload.cardId);
        if (card) {
          card.status = action.payload.status;
        }
      }
      if (state.selectedDeck?.id === action.payload.deckId) {
        const card = state.selectedDeck.cards.find(
          (c) => c.id === action.payload.cardId,
        );
        if (card) {
          card.status = action.payload.status;
        }
      }
    },
    addCard: (
      state,
      action: PayloadAction<{
        deckId: string;
        card: Card;
      }>,
    ) => {
      const deck = state.decks.find((d) => d.id === action.payload.deckId);
      if (deck) {
        deck.cards.push(action.payload.card);
        deck.cardCount = deck.cards.length;
      }
      if (state.selectedDeck?.id === action.payload.deckId) {
        state.selectedDeck.cards.push(action.payload.card);
        state.selectedDeck.cardCount = state.selectedDeck.cards.length;
      }
    },
    addCards: (
      state,
      action: PayloadAction<{
        deckId: string;
        cards: Card[];
      }>,
    ) => {
      const deck = state.decks.find((d) => d.id === action.payload.deckId);
      if (deck) {
        deck.cards.push(...action.payload.cards);
        deck.cardCount = deck.cards.length;
      }
      if (state.selectedDeck?.id === action.payload.deckId) {
        state.selectedDeck.cards.push(...action.payload.cards);
        state.selectedDeck.cardCount = state.selectedDeck.cards.length;
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchDecksIfNeeded.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchDecksIfNeeded.fulfilled, (state, action) => {
        if (action.payload) {
          state.decks = action.payload;
          state.lastFetched = Date.now();
        }
        state.isLoading = false;
      })
      .addCase(fetchDecksIfNeeded.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      .addCase(fetchDeckDetailsIfNeeded.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchDeckDetailsIfNeeded.fulfilled, (state, action) => {
        if (action.payload) {
          state.selectedDeck = action.payload;

          const index = state.decks.findIndex(
            (deck) => deck.id === action.payload.id,
          );
          if (index !== -1) {
            state.decks[index] = action.payload;
          } else {
            state.decks.push(action.payload);
          }

          state.lastFetched = Date.now();
        }
        state.isLoading = false;
      })
      .addCase(fetchDeckDetailsIfNeeded.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
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
  deleteCard,
  updateCardStatus,
  addCard,
  addCards,
} = deckSlice.actions;

export type DeckAction = ReturnType<
  (typeof deckSlice.actions)[keyof typeof deckSlice.actions]
>;
export default deckSlice.reducer;
