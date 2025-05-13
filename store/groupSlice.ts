import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface Group {
  id: string;
  name: string;
}

const initialState: Group[] = [];

export const groupSlice = createSlice({
  name: 'groups',
  initialState,
  reducers: {
    setGroups: (_, action: PayloadAction<Group[]>) => action.payload,
    addGroup: (state, action: PayloadAction<Group>) => [...state, action.payload],
  },
});

export const { setGroups, addGroup } = groupSlice.actions;
export default groupSlice.reducer;
