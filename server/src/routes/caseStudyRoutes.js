import express from 'express';
import { addCaseStudy, fetchCaseStudies, deleteCaseStudy } from '../controllers/caseStudyController.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();

// Apply protect middleware to all routes
router.use(protect);

router.post('/', addCaseStudy);
router.get('/', fetchCaseStudies);
router.delete('/:id', deleteCaseStudy);

export default router;
