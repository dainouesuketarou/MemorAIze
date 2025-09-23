import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface GroupModeState {
  groupMode: boolean;
}

const initialState: GroupModeState = {
  groupMode: false,
};

const groupModeSlice = createSlice({
  name: 'groupMode',
  initialState,
  reducers: {
    setGroupMode: (state, action: PayloadAction<boolean>) => {
      state.groupMode = action.payload;
    },
    toggleGroupMode: (state) => {
      state.groupMode = !state.groupMode;
    },
  },
});

export const { setGroupMode, toggleGroupMode } = groupModeSlice.actions;

export type GroupModeAction = ReturnType<
  (typeof groupModeSlice.actions)[keyof typeof groupModeSlice.actions]
>;

export default groupModeSlice.reducer;
