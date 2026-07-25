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
    check: string;
    points: number;
    status: 'Passed' | 'Warning' | 'Failed';
    suggestion?: string;
  }>;
}

const SUGGESTIONS: Record<string, string> = {
  'Title Tag': 'Add a concise, unique <title> — aim for 50–60 characters.',
  'Meta Description': 'Add a meta description under 160 characters summarizing the page.',
  'H1 Headings': 'Use exactly one <h1> per page — currently 0 or 2+ were found.',
  'Word Count': 'Add more content — pages under 300 words score lower on this check.',
  'Image Alt Tags': 'Add descriptive alt attributes to images missing them.',
  'Response Time': 'Reduce server/TTFB latency — consider caching or a CDN.',
};

export function calculateScore(input: ScoreInput): ScoreResult {
  const breakdownItems: Array<{ check: string; points: number; status: 'Passed' | 'Warning' | 'Failed'; suggestion?: string }> = [];

  // Title (15 pts)
  const titlePoints = input.title && input.title.trim().length > 0 ? 15 : 0;
  if (titlePoints > 0) {
    breakdownItems.push({ check: 'Title Tag', points: 15, status: 'Passed' });
  } else {
    breakdownItems.push({ check: 'Title Tag', points: 0, status: 'Failed' });
  }

  // Meta Description (15 pts)
  const metaPoints = input.metaDescription && input.metaDescription.trim().length > 0 ? 15 : 0;
  if (metaPoints > 0) {
    breakdownItems.push({ check: 'Meta Description', points: 15, status: 'Passed' });
  } else {
    breakdownItems.push({ check: 'Meta Description', points: 0, status: 'Failed' });
  }

  // Exactly 1 H1 (20 pts)
  const h1Points = input.h1Count === 1 ? 20 : 0;
  if (h1Points > 0) {
    breakdownItems.push({ check: 'H1 Headings', points: 20, status: 'Passed' });
  } else {
    breakdownItems.push({ check: 'H1 Headings', points: 0, status: 'Failed' });
  }

  // Response time (20 pts if <500ms, linear to 0 at >=3000ms)
  let responseTimePoints = 0;
  if (input.responseTimeMs < 500) {
    responseTimePoints = 20;
    breakdownItems.push({ check: 'Response Time', points: 20, status: 'Passed' });
  } else if (input.responseTimeMs >= 3000) {
    responseTimePoints = 0;
    breakdownItems.push({ check: 'Response Time', points: 0, status: 'Failed' });
  } else {
    const fraction = (3000 - input.responseTimeMs) / 2500;
    responseTimePoints = Math.round(20 * fraction * 100) / 100;
    breakdownItems.push({ check: 'Response Time', points: responseTimePoints, status: 'Warning' });
  }

  // Word count >= 300 (20 pts)
  const wordCountPoints = input.wordCount >= 300 ? 20 : 0;
  if (wordCountPoints > 0) {
    breakdownItems.push({ check: 'Word Count', points: 20, status: 'Passed' });
  } else {
    breakdownItems.push({ check: 'Word Count', points: 0, status: 'Failed' });
  }

  // Images missing alt: -5 each, up to -20 deduction
  const imageDeduction = Math.min(20, input.imagesMissingAlt * 5);
  if (input.imagesMissingAlt === 0) {
    breakdownItems.push({ check: 'Image Alt Tags', points: 0, status: 'Passed' });
  } else if (input.imagesMissingAlt <= 3) {
    breakdownItems.push({ check: 'Image Alt Tags', points: -imageDeduction, status: 'Warning' });
  } else {
    breakdownItems.push({ check: 'Image Alt Tags', points: -imageDeduction, status: 'Failed' });
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

  const itemsWithSuggestions = breakdownItems.map((item) => {
    if (item.status !== 'Passed') {
      return {
        ...item,
        suggestion: SUGGESTIONS[item.check],
      };
    }
    return item;
  });

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
    breakdownItems: itemsWithSuggestions,
  };
}
