import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface StudyHistory {
  id: string;
  deckId: string;
  progress: number;
  createdAt: string;
}

const initialState: StudyHistory[] = [];

export const studyHistorySlice = createSlice({
  name: 'studyHistory',
  initialState,
  reducers: {
    setHistories: (_, action: PayloadAction<StudyHistory[]>) => action.payload,
    addHistory: (state, action: PayloadAction<StudyHistory>) => [...state, action.payload],
  },
});

export const { setHistories, addHistory } = studyHistorySlice.actions;
export default studyHistorySlice.reducer;
