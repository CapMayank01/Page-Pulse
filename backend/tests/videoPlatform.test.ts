import { detectVideoPlatform } from '../src/services/videoPlatform.detector';
import { analyzeVideoUrl } from '../src/services/videoAudit.service';
import * as fetcherService from '../src/services/fetcher.service';

jest.mock('../src/services/fetcher.service');

describe('Video Platform Detector & Scorer', () => {
  describe('detectVideoPlatform', () => {
    it('detects a YouTube watch URL', () => {
      const p = detectVideoPlatform('https://www.youtube.com/watch?v=dQw4w9WgXcQ');
      expect(p).not.toBeNull();
      expect(p?.name).toBe('YouTube');
    });

    it('detects a YouTube mobile watch URL', () => {
      const p = detectVideoPlatform('https://m.youtube.com/watch?v=dQw4w9WgXcQ');
      expect(p).not.toBeNull();
      expect(p?.name).toBe('YouTube');
    });

    it('detects a YouTube Shorts URL', () => {
      const p = detectVideoPlatform('https://youtube.com/shorts/abc123xyz');
      expect(p).not.toBeNull();
      expect(p?.name).toBe('YouTube');
    });

    it('detects a youtu.be short link', () => {
      const p = detectVideoPlatform('https://youtu.be/dQw4w9WgXcQ');
      expect(p).not.toBeNull();
      expect(p?.name).toBe('YouTube');
    });

    it('detects an Instagram reel URL', () => {
      const p = detectVideoPlatform('https://www.instagram.com/reel/C8P4fRxt22z/');
      expect(p).not.toBeNull();
      expect(p?.name).toBe('Instagram');
    });

    it('detects an Instagram post URL', () => {
      const p = detectVideoPlatform('https://instagram.com/p/C8P4fRxt22z/');
      expect(p).not.toBeNull();
      expect(p?.name).toBe('Instagram');
    });

    it('detects an Instagram tv URL', () => {
      const p = detectVideoPlatform('https://www.instagram.com/tv/C8P4fRxt22z/');
      expect(p).not.toBeNull();
      expect(p?.name).toBe('Instagram');
    });

    it('returns null on a normal webpage URL', () => {
      const p = detectVideoPlatform('https://example.com/about-us');
      expect(p).toBeNull();
    });

    it('returns null on a non-content YouTube page', () => {
      const p = detectVideoPlatform('https://youtube.com');
      expect(p).toBeNull();
    });

    it('returns null on invalid URL strings', () => {
      const p = detectVideoPlatform('not-a-url');
      expect(p).toBeNull();
    });
  });

  describe('analyzeVideoUrl Scorer logic', () => {
    const mockPlatform = {
      name: 'YouTube',
      hosts: ['youtube.com'],
      isContentUrl: () => true,
    };

    beforeEach(() => {
      jest.resetAllMocks();
    });

    it('scores high when video metadata and fast response are found', async () => {
      const mockFetch = jest.spyOn(fetcherService, 'fetchUrl').mockResolvedValue({
        url: 'https://youtube.com/watch?v=123',
        status: 200,
        responseTimeMs: 250,
        contentType: 'text/html',
        html: '<html><head><meta property="og:video" content="https://youtube.com/v/123"></head></html>',
      });

      const result = await analyzeVideoUrl('https://youtube.com/watch?v=123', mockPlatform);
      // HTTPS (20) + Reachable (20) + Metadata (30) + Response Time (20) = 90
      expect(result.score).toBe(90);
      expect(result.grade).toBe('A');
      expect(result.status).toBe(200);
      expect(result.responseTime).toBe(250);
      
      const sum = result.breakdownItems.reduce((acc, item) => acc + item.points, 0);
      expect(Math.max(0, Math.round(sum))).toBe(result.score);
    });

    it('scores lower when metadata is missing and latency is slow', async () => {
      const mockFetch = jest.spyOn(fetcherService, 'fetchUrl').mockResolvedValue({
        url: 'https://youtube.com/watch?v=123',
        status: 200,
        responseTimeMs: 3200,
        contentType: 'text/html',
        html: '<html><head></head></html>', // missing metadata
      });

      const result = await analyzeVideoUrl('https://youtube.com/watch?v=123', mockPlatform);
      // HTTPS (20) + Reachable (20) + Metadata (0) + Response Time (0) = 40
      expect(result.score).toBe(40);
      expect(result.grade).toBe('D');
      expect(result.breakdownItems.some(i => i.check === 'Video Metadata' && i.status === 'Failed')).toBe(true);

      const sum = result.breakdownItems.reduce((acc, item) => acc + item.points, 0);
      expect(Math.max(0, Math.round(sum))).toBe(result.score);
    });

    it('handles insecure non-https URLs correctly', async () => {
      const mockFetch = jest.spyOn(fetcherService, 'fetchUrl').mockResolvedValue({
        url: 'http://youtube.com/watch?v=123',
        status: 200,
        responseTimeMs: 1750, // yields exactly 10 points
        contentType: 'text/html',
        html: '<html><head><meta name="twitter:player" content="https://youtube.com/v/123"></head></html>',
      });

      const result = await analyzeVideoUrl('http://youtube.com/watch?v=123', mockPlatform);
      // HTTPS (0) + Reachable (20) + Metadata (30) + Response Time (10) = 60
      expect(result.score).toBe(60);
      expect(result.grade).toBe('C');
      expect(result.breakdownItems.find(i => i.check === 'HTTPS Support')?.status).toBe('Failed');
      expect(result.breakdownItems.find(i => i.check === 'HTTPS Support')?.suggestion).toBeDefined();

      const sum = result.breakdownItems.reduce((acc, item) => acc + item.points, 0);
      expect(Math.max(0, Math.round(sum))).toBe(result.score);
    });

    it('detects and flags Instagram platform-level blocks as Warning with suggestions', async () => {
      const mockFetch = jest.spyOn(fetcherService, 'fetchUrl').mockResolvedValue({
        url: 'https://www.instagram.com/accounts/login/?next=/reel/C8P4fRxt22z/',
        status: 200,
        responseTimeMs: 200,
        contentType: 'text/html',
        html: '<html><head><title>Login • Instagram</title></head><body>login</body></html>',
      });

      const instagramPlatform = {
        name: 'Instagram',
        hosts: ['instagram.com'],
        isContentUrl: () => true,
      };

      const result = await analyzeVideoUrl('https://instagram.com/reel/C8P4fRxt22z/', instagramPlatform);
      // HTTPS (20) + Reachable (10, warning block) + Metadata (0, warning block) + Response Time (20) = 50
      expect(result.score).toBe(50);
      expect(result.grade).toBe('D');

      const reachableCheck = result.breakdownItems.find(i => i.check === 'Reachable Link');
      expect(reachableCheck?.status).toBe('Warning');
      expect(reachableCheck?.suggestion).toContain('blocks automated requests');

      const metadataCheck = result.breakdownItems.find(i => i.check === 'Video Metadata');
      expect(metadataCheck?.status).toBe('Warning');
      expect(metadataCheck?.suggestion).toContain('platform blocked this request');
    });
  });
});
