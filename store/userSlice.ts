import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface UserState {
  email: string;
  name?: string;
  image?: string;
}

const initialState: UserState | null = null;

export const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<UserState | null>) => {
      if (action.payload && state) {
        (state as UserState).email = action.payload.email;
        (state as UserState).name = action.payload.name;
        (state as UserState).image = action.payload.image;
      } else {
        // @ts-ignore
        return null;
      }
    },
    clearUser: () => null,
  },
});

export const { setUser, clearUser } = userSlice.actions;
export default userSlice.reducer;
