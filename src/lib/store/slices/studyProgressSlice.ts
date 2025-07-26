import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface StudyProgress {
  deckId: string;
  currentIndex: number;
  lastStudiedAt: string;
}

interface StudyProgressState {
  progress: Record<string, StudyProgress>;
}

const initialState: StudyProgressState = {
  progress: {},
};

export const studyProgressSlice = createSlice({
  name: 'studyProgress',
  initialState,
  reducers: {
    saveProgress: (state, action: PayloadAction<StudyProgress>) => {
      state.progress[action.payload.deckId] = action.payload;
    },
    clearProgress: (state, action: PayloadAction<string>) => {
      delete state.progress[action.payload];
    },
  },
});

export const { saveProgress, clearProgress } = studyProgressSlice.actions;
export default studyProgressSlice.reducer;
