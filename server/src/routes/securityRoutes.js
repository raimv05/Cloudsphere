import express from 'express';
import { addSecurityReport, fetchSecurityReports } from '../controllers/securityController.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();

// Apply protect middleware to all routes
router.use(protect);

router.post('/', addSecurityReport);
router.get('/', fetchSecurityReports);

export default router;
