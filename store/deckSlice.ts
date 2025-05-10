import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface Deck {
  id: string;
  title: string;
  description?: string;
  lastStudied?: string;
  cardCount: number;
  progress: number;
  groups: { id: string; name: string }[];
}

const initialState: Deck[] = [];

export const deckSlice = createSlice({
  name: 'decks',
  initialState,
  reducers: {
    setDecks: (_, action: PayloadAction<Deck[]>) => action.payload,
    addDeck: (state, action: PayloadAction<Deck>) => [...state, action.payload],
    updateDeck: (state, action: PayloadAction<Deck>) =>
      state.map(deck => deck.id === action.payload.id ? action.payload : deck),
    removeDeck: (state, action: PayloadAction<string>) =>
      state.filter(deck => deck.id !== action.payload),
  },
});

export const { setDecks, addDeck, updateDeck, removeDeck } = deckSlice.actions;
export default deckSlice.reducer;
