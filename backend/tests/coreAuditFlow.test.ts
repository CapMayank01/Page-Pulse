import request from 'supertest';
import app from '../src/server';

jest.mock('../src/services/fetcher.service', () => ({
  fetchUrl: jest.fn(),
}));

import { fetchUrl } from '../src/services/fetcher.service';

describe('POST /api/audit — Core Audit Flows', () => {
  afterEach(() => jest.resetAllMocks());

  // ---------- HAPPY PATH ----------
  it('returns a scored report for a valid, reachable URL', async () => {
    (fetchUrl as jest.Mock).mockResolvedValue({
      url: 'https://example.com',
      status: 200,
      responseTimeMs: 340,
      contentType: 'text/html',
      html: `
        <html>
          <head>
            <title>A Perfectly Fine Page</title>
            <meta name="description" content="A description that is reasonably descriptive and under the character limit." />
          </head>
          <body>
            <h1>Only One H1</h1>
            <p>${'word '.repeat(310)}</p>
          </body>
        </html>
      `,
    });

    const res = await request(app)
      .post('/api/audit')
      .send({ url: 'https://example.com' });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('score');
    expect(res.body).toHaveProperty('grade');
    expect(Array.isArray(res.body.breakdown)).toBe(true);

    // Scoring integrity invariant — the breakdown must actually sum to the score
    const summed = res.body.breakdown.reduce((acc: number, item: any) => acc + item.points, 0);
    expect(Math.max(0, Math.round(summed))).toBe(res.body.score);
  });

  // ---------- FAILURE CASE 1: SSRF-blocked host ----------
  it('rejects a URL that resolves to a private/loopback address', async () => {
    const res = await request(app)
      .post('/api/audit')
      .send({ url: 'http://127.0.0.1:5000/admin' });

    expect(res.status).toBe(400);
    expect(res.body.error).toHaveProperty('code', 'BLOCKED_HOST');
    // fetchUrl should never even be called — the guard must short-circuit before any network I/O
    expect(fetchUrl).not.toHaveBeenCalled();
  });

  // ---------- FAILURE CASE 2: target times out ----------
  it('returns a timeout error when the target does not respond in time', async () => {
    // Import and mock AppError to throw TIMEOUT error matching fetcher service
    const { AppError } = require('../src/errors/AppError');
    (fetchUrl as jest.Mock).mockRejectedValue(
      new AppError('TIMEOUT', 'The site took too long to respond (>10s).', 504)
    );

    const res = await request(app)
      .post('/api/audit')
      .send({ url: 'https://a-slow-or-unreachable-example.com' });

    expect([408, 504]).toContain(res.status);
    expect(res.body.error).toHaveProperty('code', 'TIMEOUT');
  });
});
