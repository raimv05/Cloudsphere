import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import surveyService from '../../services/surveyService.js';

// Fetch all surveys
export const fetchSurveys = createAsyncThunk(
  'surveys/fetchAll',
  async (_, thunkAPI) => {
    try {
      const data = await surveyService.getSurveys();
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

// Fetch survey details by ID
export const fetchSurveyById = createAsyncThunk(
  'surveys/fetchById',
  async (id, thunkAPI) => {
    try {
      const data = await surveyService.getSurveyById(id);
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

// Create a new survey
export const createSurvey = createAsyncThunk(
  'surveys/create',
  async (surveyData, thunkAPI) => {
    try {
      const data = await surveyService.createSurvey(surveyData);
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

// Submit responses to a survey
export const submitSurveyResponse = createAsyncThunk(
  'surveys/submitResponse',
  async ({ surveyId, answers }, thunkAPI) => {
    try {
      const data = await surveyService.submitResponse(surveyId, answers);
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

const initialState = {
  surveys: [],
  currentSurvey: null,
  loading: false,
  error: null
};

const surveySlice = createSlice({
  name: 'surveys',
  initialState,
  reducers: {
    clearSurveyError: (state) => {
      state.error = null;
    },
    clearCurrentSurvey: (state) => {
      state.currentSurvey = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch Surveys
      .addCase(fetchSurveys.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSurveys.fulfilled, (state, action) => {
        state.loading = false;
        state.surveys = action.payload.data;
      })
      .addCase(fetchSurveys.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Fetch Survey By ID
      .addCase(fetchSurveyById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSurveyById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentSurvey = action.payload.data;
      })
      .addCase(fetchSurveyById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Create Survey
      .addCase(createSurvey.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createSurvey.fulfilled, (state, action) => {
        state.loading = false;
        state.surveys.unshift(action.payload.data);
      })
      .addCase(createSurvey.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Submit Survey Response
      .addCase(submitSurveyResponse.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(submitSurveyResponse.fulfilled, (state, action) => {
        state.loading = false;
        state.currentSurvey = action.payload.data;
        // Update the survey in the list if it exists
        const index = state.surveys.findIndex((s) => s._id === action.payload.data._id);
        if (index !== -1) {
          state.surveys[index] = action.payload.data;
        }
      })
      .addCase(submitSurveyResponse.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  }
});

export const { clearSurveyError, clearCurrentSurvey } = surveySlice.actions;
export default surveySlice.reducer;
