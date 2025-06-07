import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { Group } from '@prisma/client';

interface GroupState {
  groups: Group[];
  isLoading: boolean;
  error: string | null;
  lastFetched: number | null;
}

const initialState: GroupState = {
  groups: [],
  isLoading: false,
  error: null,
  lastFetched: null,
};

// グループのフェッチ（必要に応じて）
export const fetchGroupsIfNeeded = createAsyncThunk(
  'group/fetchGroupsIfNeeded',
  async (_, { getState, rejectWithValue }) => {
    const state = getState() as { group: GroupState };
    const { lastFetched } = state.group;

    // 最後のフェッチから5分経過していない場合はスキップ
    if (lastFetched && Date.now() - lastFetched < 5 * 60 * 1000) {
      return null;
    }

    try {
      const response = await fetch('/api/groups');
      if (!response.ok) {
        throw new Error('グループ一覧の取得に失敗しました');
      }
      return await response.json();
    } catch (error) {
      return rejectWithValue(
        error instanceof Error ? error.message : 'データの取得に失敗しました',
      );
    }
  },
);

const groupSlice = createSlice({
  name: 'group',
  initialState,
  reducers: {
    setGroups: (state, action) => {
      state.groups = action.payload;
    },
    addGroup: (state, action) => {
      state.groups.push(action.payload);
    },
    updateGroup: (state, action) => {
      const index = state.groups.findIndex(
        (group) => group.id === action.payload.id,
      );
      if (index !== -1) {
        state.groups[index] = action.payload;
      }
    },
    deleteGroup: (state, action) => {
      state.groups = state.groups.filter(
        (group) => group.id !== action.payload,
      );
    },
    setLoading: (state, action) => {
      state.isLoading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchGroupsIfNeeded.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchGroupsIfNeeded.fulfilled, (state, action) => {
        if (action.payload) {
          state.groups = action.payload;
          state.lastFetched = Date.now();
        }
        state.isLoading = false;
      })
      .addCase(fetchGroupsIfNeeded.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
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
