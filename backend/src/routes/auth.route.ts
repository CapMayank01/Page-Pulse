import { Router } from 'express';
import { handleRegister, handleLogin, handleLogout } from '../controllers/auth.controller';
import { authRateLimiter } from '../middleware/rateLimiter';

const router = Router();

router.post('/register', authRateLimiter, handleRegister);
router.post('/login', authRateLimiter, handleLogin);
router.post('/logout', handleLogout);

export default router;
