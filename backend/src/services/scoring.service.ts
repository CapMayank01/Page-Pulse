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
  breakdownItems: Array<{
    label: string;
    points: number;
    status: 'pass' | 'warn' | 'fail';
  }>;
}

export function calculateScore(input: ScoreInput): ScoreResult {
  const breakdownItems: Array<{ label: string; points: number; status: 'pass' | 'warn' | 'fail' }> = [];

  // Title (15 pts)
  const titlePoints = input.title && input.title.trim().length > 0 ? 15 : 0;
  if (titlePoints > 0) {
    breakdownItems.push({ label: 'Title tag present & non-empty', points: 15, status: 'pass' });
  } else {
    breakdownItems.push({ label: 'Title tag missing or empty', points: 0, status: 'fail' });
  }

  // Meta Description (15 pts)
  const metaPoints = input.metaDescription && input.metaDescription.trim().length > 0 ? 15 : 0;
  if (metaPoints > 0) {
    breakdownItems.push({ label: 'Meta description present & non-empty', points: 15, status: 'pass' });
  } else {
    breakdownItems.push({ label: 'Meta description missing or empty', points: 0, status: 'fail' });
  }

  // Exactly 1 H1 (20 pts)
  const h1Points = input.h1Count === 1 ? 20 : 0;
  if (h1Points > 0) {
    breakdownItems.push({ label: 'Exactly 1 H1 heading present', points: 20, status: 'pass' });
  } else {
    breakdownItems.push({ label: `H1 heading count is ${input.h1Count} (must be exactly 1)`, points: 0, status: 'fail' });
  }

  // Response time (20 pts if <500ms, linear to 0 at >=3000ms)
  let responseTimePoints = 0;
  if (input.responseTimeMs < 500) {
    responseTimePoints = 20;
    breakdownItems.push({ label: `Response time is ${input.responseTimeMs}ms (<500ms)`, points: 20, status: 'pass' });
  } else if (input.responseTimeMs >= 3000) {
    responseTimePoints = 0;
    breakdownItems.push({ label: `Response time is ${input.responseTimeMs}ms (>=3000ms)`, points: 0, status: 'fail' });
  } else {
    const fraction = (3000 - input.responseTimeMs) / 2500;
    responseTimePoints = Math.round(20 * fraction * 100) / 100;
    breakdownItems.push({ label: `Response time is ${input.responseTimeMs}ms (500ms - 3000ms)`, points: responseTimePoints, status: 'warn' });
  }

  // Word count >= 300 (20 pts)
  const wordCountPoints = input.wordCount >= 300 ? 20 : 0;
  if (wordCountPoints > 0) {
    breakdownItems.push({ label: `Word count is ${input.wordCount} (>=300)`, points: 20, status: 'pass' });
  } else {
    breakdownItems.push({ label: `Word count is ${input.wordCount} (under 300)`, points: 0, status: 'fail' });
  }

  // Images missing alt: -5 each, up to -20 deduction
  const imageDeduction = Math.min(20, input.imagesMissingAlt * 5);
  if (input.imagesMissingAlt === 0) {
    breakdownItems.push({ label: 'All images have alternative descriptions', points: 0, status: 'pass' });
  } else if (input.imagesMissingAlt <= 3) {
    breakdownItems.push({ label: `${input.imagesMissingAlt} image(s) missing alt text`, points: -imageDeduction, status: 'warn' });
  } else {
    breakdownItems.push({ label: `${input.imagesMissingAlt} image(s) missing alt text`, points: -imageDeduction, status: 'fail' });
  }

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
    breakdownItems,
  };
}
