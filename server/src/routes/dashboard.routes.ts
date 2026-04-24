import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.middleware';
import { getDashboard, getUsage, getRoleAnalytics, getPeerComparison, getReadiness } from '../controllers/dashboard.controller';

const router = Router();

router.use(authMiddleware);

router.get('/', getDashboard);
router.get('/usage', getUsage);
router.get('/role-analytics', getRoleAnalytics);
router.get('/peer-comparison', getPeerComparison);
router.get('/readiness', getReadiness);

export default router;
