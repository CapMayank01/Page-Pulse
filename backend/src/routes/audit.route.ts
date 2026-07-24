import { Router } from 'express';
import { runAudit } from '../controllers/audit.controller';
import { optionalAuth } from '../middleware/authGuard';
import { auditRateLimiter } from '../middleware/rateLimiter';

const router = Router();

router.post('/', optionalAuth, auditRateLimiter, runAudit);

export default router;
