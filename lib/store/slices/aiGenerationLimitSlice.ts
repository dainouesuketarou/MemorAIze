import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import {
  AiGenerationLimit,
  AiGenerationLimitState,
  UpdateAiGenerationLimitParams,
} from '@/types/ai-generation-limit';

const initialState: AiGenerationLimitState = {
  limit: null,
  isLoading: true,
  error: null,
};

const aiGenerationLimitSlice = createSlice({
  name: 'aiGenerationLimit',
  initialState,
  reducers: {
    setLimit: (state, action: PayloadAction<AiGenerationLimit | null>) => {
      state.limit = action.payload;
      state.isLoading = false;
      state.error = null;
    },
    updateUsage: (
      state,
      action: PayloadAction<UpdateAiGenerationLimitParams>,
    ) => {
      if (state.limit) {
        state.limit.monthlyUsage = (state.limit.monthlyUsage || 0) + 1;
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
  resetMonthlyLimit,
  setLoading,
  setError,
} = aiGenerationLimitSlice.actions;

export default aiGenerationLimitSlice.reducer;
