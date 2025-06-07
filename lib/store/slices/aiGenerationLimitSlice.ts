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
    setLimit: (state, action: PayloadAction<AiGenerationLimit>) => {
      state.limit = action.payload;
      state.isLoading = false;
      state.error = null;
    },
    updateUsage: (
      state,
      action: PayloadAction<UpdateAiGenerationLimitParams>,
    ) => {
      if (state.limit) {
        console.log('updateUsage', action.payload);
        console.log('state.limit', state.limit);
        state.limit.monthlyUsage = action.payload.monthlyUsage;
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
