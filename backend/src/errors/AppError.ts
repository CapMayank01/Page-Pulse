export type ErrorCode =
  | 'INVALID_URL'
  | 'BLOCKED_HOST'
  | 'UNREACHABLE'
  | 'TIMEOUT'
  | 'NON_HTML'
  | 'TOO_LARGE'
  | 'RATE_LIMITED'
  | 'UNAUTHORIZED'
  | 'INTERNAL_ERROR';

export class AppError extends Error {
  public readonly code: ErrorCode;
  public readonly statusCode: number;

  constructor(code: ErrorCode, message: string, statusCode?: number) {
    super(message);
    this.name = 'AppError';
    this.code = code;
    this.statusCode = statusCode || AppError.getDefaultStatusCode(code);
    Object.setPrototypeOf(this, new.target.prototype);
  }

  public static getDefaultStatusCode(code: ErrorCode): number {
    switch (code) {
      case 'INVALID_URL':
      case 'BLOCKED_HOST':
        return 400;
      case 'UNAUTHORIZED':
        return 401;
      case 'TOO_LARGE':
        return 413;
      case 'NON_HTML':
        return 415;
      case 'RATE_LIMITED':
        return 429;
      case 'UNREACHABLE':
        return 502;
      case 'TIMEOUT':
        return 504;
      case 'INTERNAL_ERROR':
      default:
        return 500;
    }
  }
}
