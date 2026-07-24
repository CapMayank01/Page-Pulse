import { URL } from 'url';
import { AppError } from '../errors/AppError';

export function validateAndSanitizeUrl(rawUrl: string): URL {
  if (!rawUrl || typeof rawUrl !== 'string') {
    throw new AppError('INVALID_URL', 'URL parameter is required and must be a string.');
  }

  let formattedUrl = rawUrl.trim();
  if (!/^https?:\/\//i.test(formattedUrl)) {
    formattedUrl = 'https://' + formattedUrl;
  }

  let parsedUrl: URL;
  try {
    parsedUrl = new URL(formattedUrl);
  } catch {
    throw new AppError('INVALID_URL', 'The provided URL is invalid or malformed.');
  }

  if (parsedUrl.protocol !== 'http:' && parsedUrl.protocol !== 'https:') {
    throw new AppError('INVALID_URL', 'Only HTTP and HTTPS protocols are supported.');
  }

  const hostname = parsedUrl.hostname.toLowerCase();

  // Check SSRF blocked hosts
  if (isBlockedHost(hostname)) {
    throw new AppError('BLOCKED_HOST', 'Requests to local or private IP addresses are prohibited.');
  }

  return parsedUrl;
}

export function isBlockedHost(hostname: string): boolean {
  const cleanHost = hostname.replace(/^\[|\]$/g, '').trim().toLowerCase();

  // IPv6 loopback check
  if (
    cleanHost === 'localhost' ||
    cleanHost === '::1' ||
    cleanHost === '0:0:0:0:0:0:0:1' ||
    cleanHost.endsWith('.local') ||
    cleanHost.endsWith('.internal')
  ) {
    return true;
  }

  // IPv6 Unique Local Addresses (fc00::/7 -> prefix fc or fd)
  if (/^[fF][cCdD][0-9a-fA-F]{2}:/i.test(cleanHost)) return true;

  // IPv6 Link-Local Addresses (fe80::/10 -> prefix fe8, fe9, fea, feb)
  if (/^[fF][eE][89abAB][0-9a-fA-F]:/i.test(cleanHost)) return true;

  // 127.0.0.0 – 127.255.255.255
  if (/^127\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(cleanHost)) return true;

  // 0.0.0.0 – 0.255.255.255
  if (/^0\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(cleanHost)) return true;

  // IPv4 regex checks for private IP ranges
  // 10.0.0.0 – 10.255.255.255
  if (/^10\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(cleanHost)) return true;

  // 172.16.0.0 – 172.31.255.255
  const match172 = /^172\.(\d{1,3})\.\d{1,3}\.\d{1,3}$/.exec(cleanHost);
  if (match172) {
    const octet2 = parseInt(match172[1], 10);
    if (octet2 >= 16 && octet2 <= 31) return true;
  }

  // 192.168.0.0 – 192.168.255.255
  if (/^192\.168\.\d{1,3}\.\d{1,3}$/.test(cleanHost)) return true;

  // 169.254.0.0 – 169.254.255.255 (Link-local)
  if (/^169\.254\.\d{1,3}\.\d{1,3}$/.test(cleanHost)) return true;

  return false;
}
