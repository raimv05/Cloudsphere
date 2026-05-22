import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import paperService from '../../services/paperService.js';

// Async thunk to get all research papers
export const fetchPapers = createAsyncThunk(
  'papers/fetchAll',
  async (_, thunkAPI) => {
    try {
      const data = await paperService.getPapers();
      return data;
    } catch (error) {
      const message =
        (error.response && error.response.data && error.response.data.message) ||
        error.message ||
        error.toString();
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Async thunk to add a research paper
export const createPaper = createAsyncThunk(
  'papers/create',
  async (paperData, thunkAPI) => {
    try {
      const data = await paperService.createPaper(paperData);
      return data;
    } catch (error) {
      const message =
        (error.response && error.response.data && error.response.data.message) ||
        error.message ||
        error.toString();
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Async thunk to delete a research paper
export const removePaper = createAsyncThunk(
  'papers/delete',
  async (id, thunkAPI) => {
    try {
      const data = await paperService.deletePaper(id);
      return { id, message: data.message };
    } catch (error) {
      const message =
        (error.response && error.response.data && error.response.data.message) ||
        error.message ||
        error.toString();
      return thunkAPI.rejectWithValue(message);
    }
  }
);

const initialState = {
  papers: [],
  loading: false,
  error: null
};

const paperSlice = createSlice({
  name: 'papers',
  initialState,
  reducers: {
    clearPaperError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch Papers
      .addCase(fetchPapers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPapers.fulfilled, (state, action) => {
        state.loading = false;
        state.papers = action.payload.data;
      })
      .addCase(fetchPapers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Create Paper
      .addCase(createPaper.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createPaper.fulfilled, (state, action) => {
        state.loading = false;
        state.papers.unshift(action.payload.data);
      })
      .addCase(createPaper.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Delete Paper
      .addCase(removePaper.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(removePaper.fulfilled, (state, action) => {
        state.loading = false;
        state.papers = state.papers.filter((paper) => paper._id !== action.payload.id);
      })
      .addCase(removePaper.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  }
});

export const { clearPaperError } = paperSlice.actions;
export default paperSlice.reducer;
