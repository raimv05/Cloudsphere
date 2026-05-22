import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice.js';
import paperReducer from './slices/paperSlice.js';
import surveyReducer from './slices/surveySlice.js';
import caseStudyReducer from './slices/caseStudySlice.js';
import securityReducer from './slices/securitySlice.js';

// Custom middleware to log state transitions and dispatch errors
const actionLoggerMiddleware = (store) => (next) => (action) => {
  // Log thunk errors or general action errors
  if (action.type.endsWith('/rejected')) {
    console.warn(`[Redux Middleware] Action Rejected: ${action.type}`, action.payload || action.error?.message);
  } else if (action.type.endsWith('/fulfilled')) {
    console.log(`[Redux Middleware] Action Fulfilled: ${action.type}`);
  }

  return next(action);
};

const store = configureStore({
  reducer: {
    auth: authReducer,
    papers: paperReducer,
    surveys: surveyReducer,
    caseStudies: caseStudyReducer,
    security: securityReducer
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(actionLoggerMiddleware)
});

export default store;
