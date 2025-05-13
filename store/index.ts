import { configureStore } from '@reduxjs/toolkit';
import userReducer from './userSlice';
import groupReducer from './groupSlice';
import deckReducer from './deckSlice';
import cardReducer from './cardSlice';
import studyHistoryReducer from './studyHistorySlice';

export const store = configureStore({
  reducer: {
    user: userReducer,
    groups: groupReducer,
    decks: deckReducer,
    cards: cardReducer,
    studyHistory: studyHistoryReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
