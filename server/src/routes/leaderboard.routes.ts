import { Router } from 'express';
import { getLeaderboard } from '../controllers/leaderboard.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();

router.get('/', authMiddleware, getLeaderboard);

export default router;
