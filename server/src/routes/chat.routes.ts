import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.middleware';
import { chatUsageLimit } from '../middleware/usage.middleware';
import { chat } from '../controllers/chat.controller';

const router = Router();

router.use(authMiddleware);

router.post('/', chatUsageLimit(), chat);

export default router;
