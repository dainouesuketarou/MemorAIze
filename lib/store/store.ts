import { configureStore } from '@reduxjs/toolkit';
import userReducer from './slices/userSlice';
import deckReducer from './slices/deckSlice';
import groupReducer from './slices/groupSlice';
import aiGenerationLimitReducer from './slices/aiGenerationLimitSlice';
import studyProgressReducer from './slices/studyProgressSlice';
import studyReducer from './slices/studySlice';

export const store = configureStore({
  reducer: {
    user: userReducer,
    deck: deckReducer,
    group: groupReducer,
    aiGenerationLimit: aiGenerationLimitReducer,
    studyProgress: studyProgressReducer,
    study: studyReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
