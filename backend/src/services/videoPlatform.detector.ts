import { URL } from 'url';

export interface VideoPlatformConfig {
  name: string;
  hosts: string[];
  isContentUrl: (url: URL) => boolean;
}

export const VIDEO_PLATFORMS: VideoPlatformConfig[] = [
  {
    name: 'YouTube',
    hosts: ['youtube.com', 'm.youtube.com', 'youtu.be'],
    isContentUrl: (u) =>
      u.searchParams.has('v') ||
      u.pathname.startsWith('/shorts/') ||
      (u.hostname === 'youtu.be' && u.pathname.length > 1),
  },
  {
    name: 'Instagram',
    hosts: ['instagram.com'],
    isContentUrl: (u) => /^\/(reel|p|tv)\//.test(u.pathname),
  },
];

export function detectVideoPlatform(rawUrl: string): VideoPlatformConfig | null {
  try {
    const url = new URL(rawUrl);
    // Strip leading www.
    let hostname = url.hostname.toLowerCase();
    if (hostname.startsWith('www.')) {
      hostname = hostname.substring(4);
    }

    for (const platform of VIDEO_PLATFORMS) {
      if (platform.hosts.includes(hostname)) {
        // Create an object with matching hostname configuration
        const dummyUrl = new URL(rawUrl);
        // Normalize dummyUrl hostname to match comparison hosts for youtu.be path lengths
        if (hostname === 'youtu.be') {
          dummyUrl.hostname = 'youtu.be';
        }
        if (platform.isContentUrl(dummyUrl)) {
          return platform;
        }
      }
    }
  } catch (err) {
    // Return null on invalid URLs
  }
  return null;
}
