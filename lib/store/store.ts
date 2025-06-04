import { configureStore } from '@reduxjs/toolkit';
import userReducer from './slices/userSlice';
import studyProgressReducer from './slices/studyProgressSlice';

export const store = configureStore({
  reducer: {
    user: userReducer,
    studyProgress: studyProgressReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
