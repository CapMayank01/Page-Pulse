import * as cheerio from 'cheerio';
import { logger } from '../middleware/requestLogger';

export interface AnalysisMetrics {
  title: string | null;
  metaDescription: string | null;
  h1Count: number;
  imagesMissingAlt: number;
  wordCount: number;
}

export function analyzeHtml(html: string): AnalysisMetrics {
  if (!html || typeof html !== 'string') {
    return {
      title: null,
      metaDescription: null,
      h1Count: 0,
      imagesMissingAlt: 0,
      wordCount: 0,
    };
  }

  const $ = cheerio.load(html);

  // Title
  const rawTitle = $('title').first().text().trim();
  const title = rawTitle.length > 0 ? rawTitle : null;

  // Meta description
  const metaTag = $('meta[name="description" i], meta[property="og:description" i]').first();
  const rawMeta = metaTag.attr('content')?.trim() || '';
  const metaDescription = rawMeta.length > 0 ? rawMeta : null;

  // H1 count
  const h1Count = $('h1').length;

  // Images missing alt attribute
  let imagesMissingAlt = 0;
  $('img').each((_, el) => {
    const alt = $(el).attr('alt');
    if (alt === undefined) {
      imagesMissingAlt++;
    }
  });

  // Word count: extract body text excluding scripts, styles, etc.
  $('script, style, noscript, svg, iframe').remove();
  const bodyText = $('body').text().replace(/\s+/g, ' ').trim();
  const wordCount = bodyText ? bodyText.split(' ').filter(Boolean).length : 0;

  logger.info({ title, h1Count, imagesMissingAlt, wordCount }, 'HTML analysis completed');

  return {
    title,
    metaDescription,
    h1Count,
    imagesMissingAlt,
    wordCount,
  };
}
