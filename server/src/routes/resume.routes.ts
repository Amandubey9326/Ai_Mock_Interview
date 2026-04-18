import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.middleware';
import { uploadPdf } from '../middleware/upload.middleware';
import { analyzeResume } from '../controllers/resume.controller';

const router = Router();

router.use(authMiddleware);

router.post('/analyze', uploadPdf, analyzeResume);

export default router;
