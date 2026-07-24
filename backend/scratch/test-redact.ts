import { logger } from '../src/middleware/requestLogger';

const user = {
  id: 'user-123',
  email: 'hero@example.com',
  passwordHash: 'highly-secret-hash-12345',
};

// Log nested user
logger.info({ user }, 'Testing nesting redaction');
// Log direct user
logger.info(user, 'Testing direct level redaction');
// Log deeply nested user
logger.info({ context: { data: { user } } }, 'Testing deep nesting redaction');
