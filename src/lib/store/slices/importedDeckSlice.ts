import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface Deck {
  id: string;
  title: string;
  description?: string | null;
  cardCount: number;
  groups?: { name: string }[];
  shareCode?: string | null;
}

interface ImportedDeckState {
  decks: Deck[];
}

const initialState: ImportedDeckState = {
  decks: [],
};

const importedDeckSlice = createSlice({
  name: 'importedDeck',
  initialState,
  reducers: {
    setImportedDecks: (state, action: PayloadAction<Deck[]>) => {
      state.decks = action.payload;
    },
    addImportedDeck: (state, action: PayloadAction<Deck>) => {
      state.decks.unshift(action.payload);
    },
    removeImportedDeck: (state, action: PayloadAction<string>) => {
      state.decks = state.decks.filter((deck) => deck.id !== action.payload);
    },
  },
});

export const { setImportedDecks, addImportedDeck, removeImportedDeck } =
  importedDeckSlice.actions;

export default importedDeckSlice.reducer;
