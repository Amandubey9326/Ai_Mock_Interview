import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.middleware';
import { getDashboard, getUsage } from '../controllers/dashboard.controller';

const router = Router();

router.use(authMiddleware);

router.get('/', getDashboard);
router.get('/usage', getUsage);

export default router;
