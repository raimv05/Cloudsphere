import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api.js';

// Fetch all security reports
export const fetchSecurityReports = createAsyncThunk(
  'security/fetchReports',
  async (_, thunkAPI) => {
    try {
      const response = await api.get('/api/security-reports');
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

// Create a new security report
export const createSecurityReport = createAsyncThunk(
  'security/createReport',
  async (reportData, thunkAPI) => {
    try {
      const response = await api.post('/api/security-reports', reportData);
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

const initialState = {
  reports: [],
  loading: false,
  error: null
};

const securitySlice = createSlice({
  name: 'security',
  initialState,
  reducers: {
    clearSecurityError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch Security Reports
      .addCase(fetchSecurityReports.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSecurityReports.fulfilled, (state, action) => {
        state.loading = false;
        state.reports = action.payload.data;
      })
      .addCase(fetchSecurityReports.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Create Security Report
      .addCase(createSecurityReport.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createSecurityReport.fulfilled, (state, action) => {
        state.loading = false;
        state.reports.unshift(action.payload.data);
      })
      .addCase(createSecurityReport.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  }
});

export const { clearSecurityError } = securitySlice.actions;
export default securitySlice.reducer;
