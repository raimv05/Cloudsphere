import express from 'express';
import { createSurvey, fetchSurveys, getSurveyById, submitResponse } from '../controllers/surveyController.js';
import { protect } from '../middlewares/authMiddleware.js';
import { validateSurvey, validateSurveyResponse } from '../middlewares/validationMiddleware.js';

const router = express.Router();

// Apply protect middleware to all routes
router.use(protect);

router.post('/', validateSurvey, createSurvey);
router.get('/', fetchSurveys);
router.get('/:id', getSurveyById);
router.post('/:id/responses', validateSurveyResponse, submitResponse);

export default router;
