import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Group } from '@prisma/client';

interface GroupState {
  groups: Group[];
  isLoading: boolean;
  error: string | null;
}

const initialState: GroupState = {
  groups: [],
  isLoading: true,
  error: null,
};

const groupSlice = createSlice({
  name: 'group',
  initialState,
  reducers: {
    setGroups: (state, action: PayloadAction<Group[]>) => {
      state.groups = action.payload;
      state.isLoading = false;
      state.error = null;
    },
    addGroup: (state, action: PayloadAction<Group>) => {
      state.groups.push(action.payload);
    },
    updateGroup: (state, action: PayloadAction<Group>) => {
      const index = state.groups.findIndex(
        (group) => group.id === action.payload.id,
      );
      if (index !== -1) {
        state.groups[index] = action.payload;
      }
    },
    deleteGroup: (state, action: PayloadAction<string>) => {
      state.groups = state.groups.filter(
        (group) => group.id !== action.payload,
      );
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
  setGroups,
  addGroup,
  updateGroup,
  deleteGroup,
  setLoading,
  setError,
} = groupSlice.actions;

export default groupSlice.reducer;
