import { logger } from '../middleware/requestLogger';

export interface ScoreInput {
  title?: string | null;
  metaDescription?: string | null;
  h1Count: number;
  imagesMissingAlt: number;
  responseTimeMs: number;
  wordCount: number;
}

export interface ScoreResult {
  score: number;
  grade: 'A' | 'B' | 'C' | 'D' | 'F';
  breakdown: {
    titlePoints: number;
    metaPoints: number;
    h1Points: number;
    imageDeduction: number;
    responseTimePoints: number;
    wordCountPoints: number;
  };
}

export function calculateScore(input: ScoreInput): ScoreResult {
  // Title (15 pts)
  const titlePoints = input.title && input.title.trim().length > 0 ? 15 : 0;

  // Meta Description (15 pts)
  const metaPoints = input.metaDescription && input.metaDescription.trim().length > 0 ? 15 : 0;

  // Exactly 1 H1 (20 pts)
  const h1Points = input.h1Count === 1 ? 20 : 0;

  // Response time (20 pts if <500ms, linear to 0 at >=3000ms)
  let responseTimePoints = 0;
  if (input.responseTimeMs < 500) {
    responseTimePoints = 20;
  } else if (input.responseTimeMs >= 3000) {
    responseTimePoints = 0;
  } else {
    const fraction = (3000 - input.responseTimeMs) / 2500;
    responseTimePoints = Math.round(20 * fraction * 100) / 100;
  }

  // Word count >= 300 (20 pts)
  const wordCountPoints = input.wordCount >= 300 ? 20 : 0;

  // Images missing alt: -5 each, up to -20 deduction
  const imageDeduction = Math.min(20, input.imagesMissingAlt * 5);

  const rawTotal = titlePoints + metaPoints + h1Points + responseTimePoints + wordCountPoints - imageDeduction;
  const score = Math.min(100, Math.max(0, Math.round(rawTotal)));

  let grade: 'A' | 'B' | 'C' | 'D' | 'F';
  if (score >= 90) {
    grade = 'A';
  } else if (score >= 75) {
    grade = 'B';
  } else if (score >= 60) {
    grade = 'C';
  } else if (score >= 40) {
    grade = 'D';
  } else {
    grade = 'F';
  }

  logger.info({ score, grade }, 'Score calculated successfully');

  return {
    score,
    grade,
    breakdown: {
      titlePoints,
      metaPoints,
      h1Points,
      imageDeduction,
      responseTimePoints,
      wordCountPoints,
    },
  };
}
