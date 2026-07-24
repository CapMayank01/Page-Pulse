import { Request, Response, NextFunction } from 'express';
import { AppError } from '../errors/AppError';

export function errorHandler(err: any, _req: Request, res: Response, _next: NextFunction) {
  let statusCode = 500;
  let code = 'INTERNAL_ERROR';
  let message = 'An unexpected server error occurred.';

  if (err instanceof AppError) {
    statusCode = err.statusCode;
    code = err.code;
    message = err.message;
  } else if (err && typeof err === 'object' && 'code' in err && 'message' in err) {
    code = err.code || 'INTERNAL_ERROR';
    message = err.message || 'An error occurred';
    statusCode = err.statusCode || 500;
  } else if (err instanceof Error) {
    message = err.message;
  }

  res.status(statusCode).json({
    error: {
      code,
      message,
    },
  });
}
