import { createSlice } from '@reduxjs/toolkit';

const novelSlice = createSlice({
  name: 'novel',
  initialState: {
    chapters: [],
    characters: [],
    currentChapter: null,
    status: 'idle'
  },
  reducers: {
    updateChapter(state, action) {
      const index = state.chapters.findIndex(c => c.id === action.payload.id);
      state.chapters[index] = action.payload;
    }
    // Add reducers for characters, locations, etc.
  }
});

export const { updateChapter } = novelSlice.actions;
export default novelSlice.reducer;
