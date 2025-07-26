import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { CardStatus, FilterMode } from '@prisma/client';

export interface StudyCard {
  id: string;
  front: string;
  back: string;
  status: CardStatus;
  order: number;
  favorite: boolean;
}

interface StudyState {
  cards: StudyCard[];
  isLoading: boolean;
  error: string | null;
  lastFetched: Record<string, number>;
  stats: Record<FilterMode, number>;
}

const initialState: StudyState = {
  cards: [],
  isLoading: false,
  error: null,
  lastFetched: {},
  stats: {
    UNLEARNED: 0,
    MASTERED: 0,
    STRUGGLING: 0,
    FAVORITE: 0,
  },
};

// デッキのカードをフェッチ（必要に応じて）
export const fetchDeckCardsIfNeeded = createAsyncThunk(
  'study/fetchDeckCardsIfNeeded',
  async (deckId: string, { getState, rejectWithValue }) => {
    const state = getState() as { study: StudyState };
    const { lastFetched } = state.study;

    // 最後のフェッチから5分経過していない場合はスキップ
    if (
      lastFetched[deckId] &&
      Date.now() - lastFetched[deckId] < 5 * 60 * 1000
    ) {
      return null;
    }

    try {
      const response = await fetch(`/api/decks/${deckId}`);
      if (!response.ok) {
        throw new Error('カードの取得に失敗しました');
      }
      const deck = await response.json();
      return {
        cards: deck.cards || [],
        stats: {
          UNLEARNED: deck.cards.filter(
            (c: StudyCard) => c.status === 'UNLEARNED',
          ).length,
          MASTERED: deck.cards.filter((c: StudyCard) => c.status === 'MASTERED')
            .length,
          STRUGGLING: deck.cards.filter(
            (c: StudyCard) => c.status === 'STRUGGLING',
          ).length,
          FAVORITE: deck.cards.filter((c: StudyCard) => c.favorite).length,
        },
      };
    } catch (error) {
      return rejectWithValue(
        error instanceof Error ? error.message : 'データの取得に失敗しました',
      );
    }
  },
);

const studySlice = createSlice({
  name: 'study',
  initialState,
  reducers: {
    setCards: (state, action) => {
      state.cards = action.payload;
    },
    updateCardStatus: (state, action) => {
      const { cardId, status } = action.payload;
      const card = state.cards.find((c) => c.id === cardId);
      if (card) {
        card.status = status;
        // 統計情報も更新
        state.stats = {
          UNLEARNED: state.cards.filter((c) => c.status === 'UNLEARNED').length,
          MASTERED: state.cards.filter((c) => c.status === 'MASTERED').length,
          STRUGGLING: state.cards.filter((c) => c.status === 'STRUGGLING')
            .length,
          FAVORITE: state.cards.filter((c) => c.favorite).length,
        };
      }
    },
    toggleFavorite: (state, action) => {
      const card = state.cards.find((c) => c.id === action.payload);
      if (card) {
        card.favorite = !card.favorite;
        state.stats.FAVORITE = state.cards.filter((c) => c.favorite).length;
      }
    },
    setLoading: (state, action) => {
      state.isLoading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchDeckCardsIfNeeded.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchDeckCardsIfNeeded.fulfilled, (state, action) => {
        if (action.payload) {
          state.cards = action.payload.cards;
          state.stats = action.payload.stats;
          state.lastFetched[action.meta.arg] = Date.now();
        }
        state.isLoading = false;
      })
      .addCase(fetchDeckCardsIfNeeded.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const {
  setCards,
  updateCardStatus,
  toggleFavorite,
  setLoading,
  setError,
} = studySlice.actions;

export default studySlice.reducer;
