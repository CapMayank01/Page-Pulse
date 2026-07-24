import rateLimit from 'express-rate-limit';
import { AppError } from '../errors/AppError';

const isTest = process.env.NODE_ENV === 'test';

export const authRateLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: (req) => {
    if (isTest && !(req as any).headers['x-test-rate-limit']) {
      return 1000;
    }
    return 5;
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (_req, _res, next) => {
    next(new AppError('RATE_LIMITED', 'Too many authentication attempts. Please try again in a minute.', 429));
  },
});

export const auditRateLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: (req) => {
    if (isTest && !(req as any).headers['x-test-rate-limit']) {
      return 1000;
    }
    return (req as any).user ? 30 : 10;
  },
  keyGenerator: (req) => {
    return (req as any).user ? (req as any).user.userId : req.ip;
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (_req, _res, next) => {
    next(new AppError('RATE_LIMITED', 'Audit rate limit exceeded. Please wait a minute before running more audits.', 429));
  },
});
