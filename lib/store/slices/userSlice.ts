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
}

const initialState: UserState = {
  id: null,
  email: null,
  name: null,
  image: null,
  isAuthenticated: false,
  subscription: null,
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<Partial<UserState>>) => {
      return { ...state, ...action.payload };
    },
    setSubscription: (state, action: PayloadAction<Subscription | null>) => {
      state.subscription = action.payload;
    },
    clearUser: (state) => {
      return initialState;
    },
  },
});

export const { setUser, setSubscription, clearUser } = userSlice.actions;
export default userSlice.reducer;
