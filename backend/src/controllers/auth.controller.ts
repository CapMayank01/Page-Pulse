import { Request, Response, NextFunction } from 'express';
import { registerUser, loginUser } from '../services/auth.service';

const isProd = process.env.NODE_ENV === 'production';

export async function handleRegister(req: Request, res: Response, next: NextFunction) {
  try {
    const { email, password } = req.body;
    const result = await registerUser(email, password);

    res.cookie('token', result.token, {
      httpOnly: true,
      secure: isProd,
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    res.status(201).json({ user: result.user });
  } catch (err) {
    next(err);
  }
}

export async function handleLogin(req: Request, res: Response, next: NextFunction) {
  try {
    const { email, password } = req.body;
    const result = await loginUser(email, password);

    res.cookie('token', result.token, {
      httpOnly: true,
      secure: isProd,
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    res.status(200).json({ user: result.user });
  } catch (err) {
    next(err);
  }
}

export async function handleLogout(req: Request, res: Response, next: NextFunction) {
  res.clearCookie('token', {
    httpOnly: true,
    secure: isProd,
    sameSite: 'lax',
  });
  res.status(200).json({ success: true, message: 'Logged out successfully.' });
}
