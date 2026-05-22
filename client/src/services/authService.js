import api from './api.js';

/**
 * Service to handle Authentication API calls.
 */
const authService = {
  /**
   * Register a new user.
   * @param {Object} userData - { name, email, password }
   * @returns {Promise<Object>} Response data containing token and user profile
   */
  register: async (userData) => {
    const response = await api.post('/api/auth/register', userData);
    return response.data;
  },

  /**
   * Login user.
   * @param {Object} userData - { email, password }
   * @returns {Promise<Object>} Response data containing token and user profile
   */
  login: async (userData) => {
    const response = await api.post('/api/auth/login', userData);
    return response.data;
  },

  /**
   * Fetch authenticated user's profile.
   * @returns {Promise<Object>} Response data containing user profile
   */
  getProfile: async () => {
    const response = await api.get('/api/auth/profile');
    return response.data;
  }
};

export default authService;
