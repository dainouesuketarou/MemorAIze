import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface LoginHistoryItem {
  id: string;
  userId: string;
  loginAt: string;
}

interface LoginHistoryState {
  history: LoginHistoryItem[];
  loading: boolean;
  error: string | null;
}

const initialState: LoginHistoryState = {
  history: [],
  loading: false,
  error: null,
};

const loginHistorySlice = createSlice({
  name: 'loginHistory',
  initialState,
  reducers: {
    setLoginHistory: (state, action: PayloadAction<LoginHistoryItem[]>) => {
      state.history = action.payload;
      state.loading = false;
      state.error = null;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string>) => {
      state.error = action.payload;
      state.loading = false;
    },
  },
});

export const { setLoginHistory, setLoading, setError } =
  loginHistorySlice.actions;

export default loginHistorySlice.reducer;
