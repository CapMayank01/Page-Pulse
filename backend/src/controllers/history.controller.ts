import { Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthenticatedRequest } from '../middleware/authGuard';
import { AppError } from '../errors/AppError';
import { calculateScore } from '../services/scoring.service';

const prisma = new PrismaClient();

export async function getHistory(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const userId = req.user!.userId;
    const page = Math.max(1, parseInt((req.query.page as string) || '1', 10));
    const limit = Math.min(100, Math.max(1, parseInt((req.query.limit as string) || '10', 10)));
    const skip = (page - 1) * limit;

    const [total, audits] = await Promise.all([
      prisma.audit.count({ where: { userId } }),
      prisma.audit.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
    ]);

    const auditsWithBreakdown = audits.map((audit) => {
      const scoreResult = calculateScore({
        title: audit.title,
        metaDescription: audit.metaDescription,
        h1Count: audit.h1Count,
        imagesMissingAlt: audit.imagesMissingAlt,
        responseTimeMs: audit.responseTimeMs,
        wordCount: audit.wordCount,
      });
      return {
        ...audit,
        breakdown: scoreResult.breakdownItems,
      };
    });

    res.status(200).json({
      data: auditsWithBreakdown,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (err) {
    next(err);
  }
}

export async function getAuditById(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const userId = req.user!.userId;
    const { id } = req.params;

    const audit = await prisma.audit.findFirst({
      where: { id, userId },
    });

    if (!audit) {
      throw new AppError('INVALID_URL', 'Audit record not found.', 404);
    }

    const scoreResult = calculateScore({
      title: audit.title,
      metaDescription: audit.metaDescription,
      h1Count: audit.h1Count,
      imagesMissingAlt: audit.imagesMissingAlt,
      responseTimeMs: audit.responseTimeMs,
      wordCount: audit.wordCount,
    });

    res.status(200).json({
      ...audit,
      breakdown: scoreResult.breakdownItems,
    });
  } catch (err) {
    next(err);
  }
}

export async function deleteAudit(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const userId = req.user!.userId;
    const { id } = req.params;

    const existing = await prisma.audit.findFirst({
      where: { id, userId },
    });

    if (!existing) {
      throw new AppError('INVALID_URL', 'Audit record not found.', 404);
    }

    await prisma.audit.delete({
      where: { id },
    });

    res.status(200).json({ success: true, message: 'Audit deleted successfully.' });
  } catch (err) {
    next(err);
  }
}
