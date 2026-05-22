import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api.js';

// Fetch all case studies
export const fetchCaseStudies = createAsyncThunk(
  'caseStudies/fetchAll',
  async (_, thunkAPI) => {
    try {
      const response = await api.get('/api/case-studies');
      return response.data;
    } catch (error) {
      const message =
        (error.response && error.response.data && error.response.data.message) ||
        error.message ||
        error.toString();
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Create a new case study
export const createCaseStudy = createAsyncThunk(
  'caseStudies/create',
  async (caseStudyData, thunkAPI) => {
    try {
      const response = await api.post('/api/case-studies', caseStudyData);
      return response.data;
    } catch (error) {
      const message =
        (error.response && error.response.data && error.response.data.message) ||
        error.message ||
        error.toString();
      return thunkAPI.rejectWithValue(message);
    }
  }
);

// Delete a case study
export const removeCaseStudy = createAsyncThunk(
  'caseStudies/delete',
  async (id, thunkAPI) => {
    try {
      const response = await api.delete(`/api/case-studies/${id}`);
      return { id, message: response.data.message };
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
  caseStudies: [],
  loading: false,
  error: null
};

const caseStudySlice = createSlice({
  name: 'caseStudies',
  initialState,
  reducers: {
    clearCaseStudyError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch Case Studies
      .addCase(fetchCaseStudies.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCaseStudies.fulfilled, (state, action) => {
        state.loading = false;
        state.caseStudies = action.payload.data;
      })
      .addCase(fetchCaseStudies.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Create Case Study
      .addCase(createCaseStudy.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createCaseStudy.fulfilled, (state, action) => {
        state.loading = false;
        state.caseStudies.unshift(action.payload.data);
      })
      .addCase(createCaseStudy.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Delete Case Study
      .addCase(removeCaseStudy.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(removeCaseStudy.fulfilled, (state, action) => {
        state.loading = false;
        state.caseStudies = state.caseStudies.filter((cs) => cs._id !== action.payload.id);
      })
      .addCase(removeCaseStudy.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  }
});

export const { clearCaseStudyError } = caseStudySlice.actions;
export default caseStudySlice.reducer;
