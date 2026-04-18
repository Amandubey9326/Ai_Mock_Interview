import { Router } from 'express';
import { register, login, updateProfile, changePassword, forgotPassword, resetPassword, deleteAccount } from '../controllers/auth.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();

router.post('/register', register);
router.post('/login', login);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);
router.patch('/profile', authMiddleware, updateProfile);
router.patch('/password', authMiddleware, changePassword);
router.delete('/account', authMiddleware, deleteAccount);

export default router;
