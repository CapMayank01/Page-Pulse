import axios, { AxiosError } from 'axios';
import dns from 'dns';
import { AppError } from '../errors/AppError';
import { validateAndSanitizeUrl, isBlockedHost } from '../utils/validateUrl';
import { logger } from '../middleware/requestLogger';

export interface FetchResult {
  url: string;
  status: number;
  responseTimeMs: number;
  contentType: string;
  html: string;
}

const MAX_CONTENT_LENGTH = 5 * 1024 * 1024; // 5 MB
const TIMEOUT_MS = 10000; // 10 seconds

async function checkDnsRebinding(hostname: string) {
  try {
    const lookupResult = await dns.promises.lookup(hostname);
    if (isBlockedHost(lookupResult.address)) {
      logger.warn({ hostname, address: lookupResult.address }, 'SSRF blocked by DNS rebinding check');
      throw new AppError('BLOCKED_HOST', 'Requests to local or private IP addresses are prohibited.');
    }
  } catch (err: any) {
    if (err instanceof AppError) throw err;
    // DNS resolution failure will be handled by axios request
  }
}

export async function fetchUrl(targetUrl: string): Promise<FetchResult> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);

  const startTime = Date.now();
  let currentUrl = validateAndSanitizeUrl(targetUrl);
  let redirectHops = 0;
  const maxRedirects = 5;

  try {
    // DNS-rebinding guard on initial URL
    await checkDnsRebinding(currentUrl.hostname);

    let response: any;
    let finalUrl = currentUrl.toString();

    while (true) {
      response = await axios.get(finalUrl, {
        timeout: TIMEOUT_MS,
        signal: controller.signal,
        maxContentLength: MAX_CONTENT_LENGTH,
        maxBodyLength: MAX_CONTENT_LENGTH,
        maxRedirects: 0, // set maxRedirects to 0 to handle manually
        headers: {
          'User-Agent': 'PagePulse-Auditor/1.0 (+https://pagepulse.app)',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        },
        responseType: 'text',
        validateStatus: () => true, // accept all statuses to check for 3xx manually
      });

      // Handle redirect status codes manually
      if (response.status >= 300 && response.status < 400) {
        const locationHeader = response.headers['location'];
        if (!locationHeader) {
          break; // Proceed with this response if location is missing
        }

        if (redirectHops >= maxRedirects) {
          throw new AppError('UNREACHABLE', 'Too many redirects occurred while trying to reach the site.');
        }

        const resolvedRedirectUrl = new URL(locationHeader, finalUrl).toString();
        logger.info({ finalUrl, resolvedRedirectUrl }, 'Fetcher manual redirection hop');
        currentUrl = validateAndSanitizeUrl(resolvedRedirectUrl);

        // DNS-rebinding guard on redirect URL
        await checkDnsRebinding(currentUrl.hostname);

        finalUrl = currentUrl.toString();
        redirectHops++;
      } else {
        break; // Non-3xx response, exit loop
      }
    }

    const responseTimeMs = Date.now() - startTime;
    let contentTypeHeader = (response.headers['content-type'] as string) || '';

    // Check content length if specified in headers
    const contentLengthHeader = response.headers['content-length'];
    if (contentLengthHeader && parseInt(String(contentLengthHeader), 10) > MAX_CONTENT_LENGTH) {
      throw new AppError('TOO_LARGE', 'Response payload exceeds 5MB size limit.');
    }

    const htmlContent = typeof response.data === 'string' ? response.data : String(response.data || '');
    if (htmlContent.length > MAX_CONTENT_LENGTH) {
      throw new AppError('TOO_LARGE', 'Response content exceeds maximum allowed size.');
    }

    // Gracefully handle missing Content-Type header by sniffing response body
    if (!contentTypeHeader) {
      const trimmed = htmlContent.trim().toLowerCase();
      const first500 = trimmed.substring(0, 500);
      const isHtmlSniff = first500.startsWith('<!doctype html') || first500.includes('<html');

      if (isHtmlSniff) {
        contentTypeHeader = 'text/html';
      } else {
        throw new AppError('NON_HTML', 'Requested page returned non-HTML content and failed HTML body sniffing.');
      }
    } else if (!contentTypeHeader.toLowerCase().includes('text/html') && !contentTypeHeader.toLowerCase().includes('application/xhtml+xml')) {
      throw new AppError('NON_HTML', `Requested page returned non-HTML content-type: ${contentTypeHeader}`);
    }

    return {
      url: finalUrl,
      status: response.status,
      responseTimeMs,
      contentType: contentTypeHeader,
      html: htmlContent,
    };
  } catch (err: any) {
    logger.error({ targetUrl, error: err.message || err }, 'Failed to fetch target URL');
    if (err instanceof AppError) {
      throw err;
    }

    if (axios.isCancel(err) || err.code === 'ECONNABORTED' || err.name === 'AbortError') {
      throw new AppError('TIMEOUT', 'The site took too long to respond (>10s).');
    }

    if (axios.isAxiosError(err)) {
      const axiosErr = err as AxiosError;
      if (axiosErr.code === 'ERR_FR_TOO_MANY_REDIRECTS') {
        throw new AppError('UNREACHABLE', 'Too many redirects occurred while trying to reach the site.');
      }
      if (
        axiosErr.code === 'ENOTFOUND' ||
        axiosErr.code === 'ECONNREFUSED' ||
        axiosErr.code === 'EHOSTUNREACH' ||
        axiosErr.code === 'ENETUNREACH'
      ) {
        throw new AppError('UNREACHABLE', 'Could not establish connection to the host domain.');
      }
      if (axiosErr.response && axiosErr.response.status === 413) {
        throw new AppError('TOO_LARGE', 'Response payload size exceeded limit.');
      }
    }

    throw new AppError('UNREACHABLE', `Failed to reach site: ${err.message || 'Unknown network error'}`);
  } finally {
    clearTimeout(timeoutId);
  }
}
