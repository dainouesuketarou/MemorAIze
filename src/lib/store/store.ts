import { configureStore } from '@reduxjs/toolkit';
import userReducer from './slices/userSlice';
import deckReducer from './slices/deckSlice';
import groupReducer from './slices/groupSlice';
import groupModeReducer from './slices/groupModeSlice';
import aiGenerationLimitReducer from './slices/aiGenerationLimitSlice';
import studyProgressReducer from './slices/studyProgressSlice';
import studyReducer from './slices/studySlice';
import importedDeckReducer from './slices/importedDeckSlice';
import loginHistoryReducer from './slices/loginHistorySlice';

export const store = configureStore({
  reducer: {
    user: userReducer,
    deck: deckReducer,
    group: groupReducer,
    groupMode: groupModeReducer,
    aiGenerationLimit: aiGenerationLimitReducer,
    studyProgress: studyProgressReducer,
    study: studyReducer,
    importedDeck: importedDeckReducer,
    loginHistory: loginHistoryReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
