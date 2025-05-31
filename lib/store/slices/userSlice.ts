import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { SubscriptionStatus, SubscriptionPlan } from '@prisma/client';

interface Subscription {
  status: SubscriptionStatus;
  plan: SubscriptionPlan;
  stripeSubscriptionId: string | null;
  stripePriceId: string | null;
  stripeCurrentPeriodEnd: Date | null;
}

interface UserState {
  id: string | null;
  email: string | null;
  name: string | null;
  image: string | null;
  isAuthenticated: boolean;
  subscription: Subscription | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: UserState = {
  id: null,
  email: null,
  name: null,
  image: null,
  isAuthenticated: false,
  subscription: null,
  isLoading: true,
  error: null,
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<Partial<UserState>>) => {
      return {
        ...state,
        ...action.payload,
        isLoading: false,
        error: null,
      };
    },
    setSubscription: (state, action: PayloadAction<Subscription | null>) => {
      state.subscription = action.payload;
      state.isLoading = false;
      state.error = null;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
      state.isLoading = false;
    },
    clearUser: (state) => {
      return { ...initialState, isLoading: false };
    },
  },
});

export const { setUser, setSubscription, setLoading, setError, clearUser } =
  userSlice.actions;

export default userSlice.reducer;
