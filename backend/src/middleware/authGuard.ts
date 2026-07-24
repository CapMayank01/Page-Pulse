import { Request, Response, NextFunction } from 'express';
import { verifyToken, UserPayload } from '../services/auth.service';
import { AppError } from '../errors/AppError';

export interface AuthenticatedRequest extends Request {
  user?: UserPayload;
}

function extractToken(req: Request): string | null {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7);
  }

  const cookieHeader = req.headers.cookie;
  if (cookieHeader) {
    const parts = cookieHeader.split(';');
    for (const part of parts) {
      const [key, val] = part.split('=');
      if (key && val && key.trim() === 'token') {
        return val.trim();
      }
    }
  }
  return null;
}

export function optionalAuth(req: AuthenticatedRequest, _res: Response, next: NextFunction) {
  const token = extractToken(req);
  if (token) {
    try {
      req.user = verifyToken(token);
    } catch {
      // Ignore token verification error for optional auth
    }
  }
  next();
}

export function requireAuth(req: AuthenticatedRequest, _res: Response, next: NextFunction) {
  const token = extractToken(req);
  if (!token) {
    return next(new AppError('UNAUTHORIZED', 'Authentication token is required for this route.', 401));
  }

  try {
    req.user = verifyToken(token);
    next();
  } catch (err) {
    next(err);
  }
}
