import express from 'express';
import {
  addPaper,
  getPapers,
  deletePaper
} from '../controllers/paperController.js';
import { protect } from '../middlewares/authMiddleware.js';
import { validatePaper } from '../middlewares/validationMiddleware.js';

const router = express.Router();

// Apply protect middleware to all routes in this router
router.use(protect);

router.route('/')
  .post(validatePaper, addPaper)
  .get(getPapers);

router.route('/:id')
  .delete(deletePaper);

export default router;
