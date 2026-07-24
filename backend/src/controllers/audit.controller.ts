import { Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthenticatedRequest } from '../middleware/authGuard';
import { validateAndSanitizeUrl } from '../utils/validateUrl';
import { fetchUrl } from '../services/fetcher.service';
import { analyzeHtml } from '../services/analyzer.service';
import { calculateScore } from '../services/scoring.service';

const prisma = new PrismaClient();

export async function runAudit(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  try {
    const { url } = req.body;
    const sanitizedUrl = validateAndSanitizeUrl(url);

    // Fetch site
    const fetchResult = await fetchUrl(sanitizedUrl.toString());

    // Analyze content
    const metrics = analyzeHtml(fetchResult.html);

    // Compute score & grade
    const scoreResult = calculateScore({
      title: metrics.title,
      metaDescription: metrics.metaDescription,
      h1Count: metrics.h1Count,
      imagesMissingAlt: metrics.imagesMissingAlt,
      responseTimeMs: fetchResult.responseTimeMs,
      wordCount: metrics.wordCount,
    });

    let savedToHistory = false;
    let auditRecordId: string | undefined;

    // If authenticated, persist to database
    if (req.user && req.user.userId) {
      try {
        const savedAudit = await prisma.audit.create({
          data: {
            url: fetchResult.url,
            status: fetchResult.status,
            responseTimeMs: fetchResult.responseTimeMs,
            title: metrics.title,
            metaDescription: metrics.metaDescription,
            h1Count: metrics.h1Count,
            imagesMissingAlt: metrics.imagesMissingAlt,
            wordCount: metrics.wordCount,
            score: scoreResult.score,
            grade: scoreResult.grade,
            userId: req.user.userId,
          },
        });
        savedToHistory = true;
        auditRecordId = savedAudit.id;
      } catch (dbErr) {
        // Log DB save error, but don't fail audit calculation for user
        console.error('Failed to save audit history:', dbErr);
      }
    }

    res.status(200).json({
      id: auditRecordId,
      url: fetchResult.url,
      status: fetchResult.status,
      responseTimeMs: fetchResult.responseTimeMs,
      title: metrics.title,
      metaDescription: metrics.metaDescription,
      h1Count: metrics.h1Count,
      imagesMissingAlt: metrics.imagesMissingAlt,
      wordCount: metrics.wordCount,
      contentType: fetchResult.contentType,
      score: scoreResult.score,
      grade: scoreResult.grade,
      breakdown: scoreResult.breakdownItems,
      savedToHistory,
    });
  } catch (err) {
    next(err);
  }
}
