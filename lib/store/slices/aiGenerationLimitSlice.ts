import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface AiGenerationLimit {
  id: string;
  userId: string;
  dailyLimit: number;
  monthlyLimit: number;
  dailyUsage: number;
  monthlyUsage: number;
  lastResetDate: Date;
  lastResetMonth: Date;
}

interface AiGenerationLimitState {
  limit: AiGenerationLimit | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: AiGenerationLimitState = {
  limit: null,
  isLoading: true,
  error: null,
};

const aiGenerationLimitSlice = createSlice({
  name: 'aiGenerationLimit',
  initialState,
  reducers: {
    setLimit: (state, action: PayloadAction<AiGenerationLimit>) => {
      state.limit = action.payload;
      state.isLoading = false;
      state.error = null;
    },
    updateUsage: (
      state,
      action: PayloadAction<{ dailyUsage: number; monthlyUsage: number }>,
    ) => {
      if (state.limit) {
        state.limit.dailyUsage = action.payload.dailyUsage;
        state.limit.monthlyUsage = action.payload.monthlyUsage;
      }
    },
    resetDailyLimit: (state) => {
      if (state.limit) {
        state.limit.dailyUsage = 0;
        state.limit.lastResetDate = new Date();
      }
    },
    resetMonthlyLimit: (state) => {
      if (state.limit) {
        state.limit.monthlyUsage = 0;
        state.limit.lastResetMonth = new Date();
      }
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
      state.isLoading = false;
    },
  },
});

export const {
  setLimit,
  updateUsage,
  resetDailyLimit,
  resetMonthlyLimit,
  setLoading,
  setError,
} = aiGenerationLimitSlice.actions;

export default aiGenerationLimitSlice.reducer;
