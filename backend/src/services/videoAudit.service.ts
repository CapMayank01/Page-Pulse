import { fetchUrl } from './fetcher.service';
import { VideoPlatformConfig } from './videoPlatform.detector';

export interface VideoScoreResult {
  mode: 'video';
  platform: string;
  score: number;
  grade: 'A' | 'B' | 'C' | 'D' | 'F';
  status: number;
  responseTime: number;
  breakdown: {
    httpsPoints: number;
    reachablePoints: number;
    metadataPoints: number;
    responseTimePoints: number;
  };
  breakdownItems: Array<{
    check: string;
    points: number;
    status: 'Passed' | 'Warning' | 'Failed';
    suggestion?: string;
  }>;
}

const VIDEO_SUGGESTIONS: Record<string, string> = {
  'HTTPS Support': 'Configure the URL to use secure HTTPS communication.',
  'Reachable Link': 'Verify that the video page returns a successful HTTP 200 status.',
  'Video Metadata': 'Add OpenGraph (og:video) or Twitter Card (twitter:player) tags to embed properly.',
  'Response Time': 'Optimize platform load speeds — ensure low latency connections.',
}

function isPlatformBlocked(platform: string, finalUrl: string, html: string): boolean {
  if (platform === 'Instagram') {
    const lowerHtml = html.toLowerCase();
    const hasMeta = html.includes('og:video') || html.includes('twitter:player');
    return (
      finalUrl.includes('/accounts/login') ||
      (lowerHtml.includes('login') && !hasMeta)
    );
  }
  return false;
}

export async function analyzeVideoUrl(url: string, platform: VideoPlatformConfig): Promise<VideoScoreResult> {
  const startTime = Date.now();
  let status = 0;
  let responseTime = 0;
  let html = '';
  let finalUrl = url;

  try {
    const fetchResult = await fetchUrl(url);
    status = fetchResult.status;
    responseTime = fetchResult.responseTimeMs;
    html = fetchResult.html;
    finalUrl = fetchResult.url;
  } catch (err: any) {
    status = err.status || 0;
    responseTime = Date.now() - startTime;
  }

  const breakdownItems: Array<{ check: string; points: number; status: 'Passed' | 'Warning' | 'Failed'; suggestion?: string }> = [];

  // Check 1: HTTPS (20 pts)
  const isHttps = url.toLowerCase().startsWith('https://');
  const httpsPoints = isHttps ? 20 : 0;
  breakdownItems.push({
    check: 'HTTPS Support',
    points: httpsPoints,
    status: isHttps ? 'Passed' : 'Failed',
  });

  // Check 2: Reachable (20 pts or 10 pts warning if platform blocked)
  const blocked = isPlatformBlocked(platform.name, finalUrl, html);
  let reachablePoints = 0;

  if (blocked) {
    reachablePoints = 10;
    breakdownItems.push({
      check: 'Reachable Link',
      points: 10,
      status: 'Warning',
      suggestion: `${platform.name} blocks automated requests to this content page. This is a platform-level restriction, not a problem with your link.`,
    });
  } else {
    const isReachable = status >= 200 && status < 300;
    reachablePoints = isReachable ? 20 : 0;
    breakdownItems.push({
      check: 'Reachable Link',
      points: reachablePoints,
      status: isReachable ? 'Passed' : 'Failed',
      ...(isReachable ? {} : { suggestion: "This link did not return a successful response — check it's public and correctly typed." }),
    });
  }

  // Check 3: Video metadata present (30 pts or Warning if blocked)
  let metadataPoints = 0;
  if (blocked) {
    metadataPoints = 0;
    breakdownItems.push({
      check: 'Video Metadata',
      points: 0,
      status: 'Warning',
      suggestion: 'Metadata could not be checked because the platform blocked this request.',
    });
  } else {
    const hasMetadata = html.includes('og:video') || html.includes('twitter:player');
    metadataPoints = hasMetadata ? 30 : 0;
    breakdownItems.push({
      check: 'Video Metadata',
      points: metadataPoints,
      status: hasMetadata ? 'Passed' : 'Failed',
      ...(hasMetadata ? {} : { suggestion: 'Add og:video or twitter:player meta tags so the link unfurls properly when shared.' }),
    });
  }

  // Check 4: Response time (20 pts, scaled)
  let responseTimePoints = 0;
  let responseTimeStatus: 'Passed' | 'Warning' | 'Failed' = 'Failed';

  if (responseTime < 500) {
    responseTimePoints = 20;
    responseTimeStatus = 'Passed';
  } else if (responseTime >= 3000) {
    responseTimePoints = 0;
    responseTimeStatus = 'Failed';
  } else {
    const fraction = (3000 - responseTime) / 2500;
    responseTimePoints = Math.round(20 * fraction * 100) / 100;
    responseTimeStatus = 'Warning';
  }

  breakdownItems.push({
    check: 'Response Time',
    points: responseTimePoints,
    status: responseTimeStatus,
  });

  // Attach suggestions to non-Passed checks if not already set
  const itemsWithSuggestions = breakdownItems.map((item) => {
    if (item.status !== 'Passed' && !item.suggestion) {
      return {
        ...item,
        suggestion: VIDEO_SUGGESTIONS[item.check],
      };
    }
    return item;
  });

  const totalScore = httpsPoints + reachablePoints + metadataPoints + responseTimePoints;
  // Cap at 90 maximum like normal audits
  const score = Math.min(90, Math.max(0, Math.round(totalScore)));

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

  return {
    mode: 'video',
    platform: platform.name,
    score,
    grade,
    status,
    responseTime,
    breakdown: {
      httpsPoints,
      reachablePoints,
      metadataPoints,
      responseTimePoints,
    },
    breakdownItems: itemsWithSuggestions,
  };
}
