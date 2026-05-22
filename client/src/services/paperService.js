import api from './api.js';

/**
 * Service to handle Research Papers API calls.
 */
const paperService = {
  /**
   * Fetch all research papers.
   * @returns {Promise<Object>} List of research papers
   */
  getPapers: async () => {
    const response = await api.get('/api/papers');
    return response.data;
  },

  /**
   * Submit a new research paper.
   * @param {Object} paperData - { title, category, summary }
   * @returns {Promise<Object>} Created paper object
   */
  createPaper: async (paperData) => {
    const response = await api.post('/api/papers', paperData);
    return response.data;
  },

  /**
   * Delete a research paper.
   * @param {string} id - The ID of the research paper to delete
   * @returns {Promise<Object>} Delete confirmation message
   */
  deletePaper: async (id) => {
    const response = await api.delete(`/api/papers/${id}`);
    return response.data;
  }
};

export default paperService;
