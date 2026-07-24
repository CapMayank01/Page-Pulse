import request from 'supertest';
import app from '../src/server';

describe('Rate Limiting Integration Tests', () => {
  it('should enforce 5 requests/min for auth routes when x-test-rate-limit is set', async () => {
    // Send 5 quick requests
    for (let i = 0; i < 5; i++) {
      const res = await request(app)
        .post('/api/auth/register')
        .set('x-test-rate-limit', 'true')
        .send({ email: `test-rate-${i}@example.com`, password: 'password123' });
      
      // They could succeed or fail on validation/conflict, but shouldn't be 429
      expect(res.status).not.toBe(429);
    }

    // 6th request should hit 429
    const limitRes = await request(app)
      .post('/api/auth/register')
      .set('x-test-rate-limit', 'true')
      .send({ email: 'test-rate-6@example.com', password: 'password123' });

    expect(limitRes.status).toBe(429);
    expect(limitRes.body.error).toBeDefined();
    expect(limitRes.body.error.code).toBe('RATE_LIMITED');
  }, 15000);

  it('should enforce 10 requests/min for anonymous audits when x-test-rate-limit is set', async () => {
    // Send 10 quick requests
    for (let i = 0; i < 10; i++) {
      const res = await request(app)
        .post('/api/audit')
        .set('x-test-rate-limit', 'true')
        .send({ url: 'http://localhost:3000' }); // hits validation but should bypass/not 429
      
      expect(res.status).not.toBe(429);
    }

    // 11th request should hit 429
    const limitRes = await request(app)
      .post('/api/audit')
      .set('x-test-rate-limit', 'true')
      .send({ url: 'http://localhost:3000' });

    expect(limitRes.status).toBe(429);
    expect(limitRes.body.error.code).toBe('RATE_LIMITED');
  }, 15000);
});
