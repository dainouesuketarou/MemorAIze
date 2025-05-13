import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export type CardStatus = 'UNLEARNED' | 'MASTERED' | 'STRUGGLING';

export interface Card {
  id: string;
  front: string;
  back: string;
  status: CardStatus;
  deckId: string;
}

const initialState: Card[] = [];

export const cardSlice = createSlice({
  name: 'cards',
  initialState,
  reducers: {
    setCards: (_, action: PayloadAction<Card[]>) => action.payload,
    addCard: (state, action: PayloadAction<Card>) => [...state, action.payload],
    updateCard: (state, action: PayloadAction<Card>) =>
      state.map(card => card.id === action.payload.id ? action.payload : card),
    removeCard: (state, action: PayloadAction<string>) =>
      state.filter(card => card.id !== action.payload),
  },
});

export const { setCards, addCard, updateCard, removeCard } = cardSlice.actions;
export default cardSlice.reducer;
