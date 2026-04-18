import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.middleware';
import { interviewUsageLimit } from '../middleware/usage.middleware';
import {
  createInterview,
  listInterviews,
  getInterview,
  generateQuestion,
  submitAnswer,
} from '../controllers/interview.controller';

const router = Router();

router.use(authMiddleware);

router.post('/', interviewUsageLimit(), createInterview);
router.get('/', listInterviews);
router.get('/:id', getInterview);
router.post('/:id/questions', generateQuestion);
router.post('/:id/questions/:qid/answer', submitAnswer);

export default router;
