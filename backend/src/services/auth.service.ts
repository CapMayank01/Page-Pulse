import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
import { AppError } from '../errors/AppError';

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret';

export interface UserPayload {
  userId: string;
  email: string;
}

export async function registerUser(email: string, password: string): Promise<{ token: string; user: { id: string; email: string } }> {
  if (!email || !password) {
    throw new AppError('INVALID_URL', 'Email and password are required.', 400); // 400 validation error
  }

  const normalizedEmail = email.trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
    throw new AppError('INVALID_URL', 'Invalid email address format.', 400);
  }

  if (password.length < 6) {
    throw new AppError('INVALID_URL', 'Password must be at least 6 characters long.', 400);
  }

  const existingUser = await prisma.user.findUnique({
    where: { email: normalizedEmail },
  });

  if (existingUser) {
    throw new AppError('INVALID_URL', 'An account with this email already exists.', 400);
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({
    data: {
      email: normalizedEmail,
      passwordHash,
    },
  });

  const token = jwt.sign({ userId: user.id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });

  return {
    token,
    user: {
      id: user.id,
      email: user.email,
    },
  };
}

export async function loginUser(email: string, password: string): Promise<{ token: string; user: { id: string; email: string } }> {
  if (!email || !password) {
    throw new AppError('UNAUTHORIZED', 'Email and password are required.', 401);
  }

  const normalizedEmail = email.trim().toLowerCase();
  const user = await prisma.user.findUnique({
    where: { email: normalizedEmail },
  });

  if (!user) {
    throw new AppError('UNAUTHORIZED', 'Invalid email or password.', 401);
  }

  const isMatch = await bcrypt.compare(password, user.passwordHash);
  if (!isMatch) {
    throw new AppError('UNAUTHORIZED', 'Invalid email or password.', 401);
  }

  const token = jwt.sign({ userId: user.id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });

  return {
    token,
    user: {
      id: user.id,
      email: user.email,
    },
  };
}

export function verifyToken(token: string): UserPayload {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as UserPayload;
    return decoded;
  } catch {
    throw new AppError('UNAUTHORIZED', 'Invalid or expired token.', 401);
  }
}
