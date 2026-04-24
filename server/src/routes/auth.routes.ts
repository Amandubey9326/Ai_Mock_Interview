import { Router } from 'express';
import { register, login, updateProfile, changePassword, forgotPassword, resetPassword, deleteAccount, googleLogin, verifyEmail, resendVerification } from '../controllers/auth.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();

router.post('/register', register);
router.post('/login', login);
router.post('/google', googleLogin);
router.post('/verify-email', authMiddleware, verifyEmail);
router.post('/resend-verification', authMiddleware, resendVerification);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);
router.patch('/profile', authMiddleware, updateProfile);
router.patch('/password', authMiddleware, changePassword);
router.delete('/account', authMiddleware, deleteAccount);

export default router;
