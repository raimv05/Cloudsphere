import axios from 'axios';

// Determine API base URL
const getApiBaseUrl = () => {
  // Use environment variable if set (via Render/deployment)
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }
  
  // In production (deployed to Render/Vercel), auto-detect backend URL
  if (typeof window !== 'undefined' && window.location.hostname !== 'localhost') {
    // For Render: assumes backend is at same domain pattern (e.g., cloudsphere-backend)
    const host = window.location.hostname;
    if (host.includes('onrender.com')) {
      // Use the backend URL for Render deployments
      return 'https://cloudsphere-backend.onrender.com';
    }
  }
  
  // Default to localhost for local development
  return 'http://localhost:5000';
};

// Create custom Axios instance
const api = axios.create({
  baseURL: getApiBaseUrl(),
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor to automatically attach authorization header
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;
