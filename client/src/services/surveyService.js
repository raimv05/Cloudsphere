import api from './api.js';

/**
 * Service to handle Surveys API calls.
 */
const surveyService = {
  /**
   * Fetch all surveys.
   * @returns {Promise<Object>} List of surveys
   */
  getSurveys: async () => {
    const response = await api.get('/api/surveys');
    return response.data;
  },

  /**
   * Fetch details of a survey by its ID.
   * @param {string} id - The ID of the survey
   * @returns {Promise<Object>} Survey details
   */
  getSurveyById: async (id) => {
    const response = await api.get(`/api/surveys/${id}`);
    return response.data;
  },

  /**
   * Create a new survey.
   * @param {Object} surveyData - { title, questions: [{ text, type, options }] }
   * @returns {Promise<Object>} Created survey object
   */
  createSurvey: async (surveyData) => {
    const response = await api.post('/api/surveys', surveyData);
    return response.data;
  },

  /**
   * Submit responses/answers to a survey.
   * @param {string} surveyId - The ID of the survey
   * @param {Array<Object>} answers - [{ questionId, value }]
   * @returns {Promise<Object>} Updated survey object including the new response
   */
  submitResponse: async (surveyId, answers) => {
    const response = await api.post(`/api/surveys/${surveyId}/responses`, { answers });
    return response.data;
  }
};

export default surveyService;
