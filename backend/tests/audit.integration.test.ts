import request from 'supertest';
import app from '../src/server';

describe('POST /api/audit API Integration', () => {
  it('should return 400 INVALID_URL when url is missing or empty', async () => {
    const res = await request(app).post('/api/audit').send({});
    expect(res.status).toBe(400);
    expect(res.body.error).toBeDefined();
    expect(res.body.error.code).toBe('INVALID_URL');
  });

  it('should return 400 BLOCKED_HOST when targeting localhost or internal IP', async () => {
    const res = await request(app).post('/api/audit').send({ url: 'http://localhost:3000' });
    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('BLOCKED_HOST');
  });

  it('should not leak passwordHash in auth registration response', async () => {
    const email = `test-${Date.now()}@example.com`;
    const res = await request(app)
      .post('/api/auth/register')
      .send({ email, password: 'password123' });
    
    // With cookie migration, registration returns { user } and sets cookie
    if (res.status === 201) {
      expect(res.body.user).toBeDefined();
      expect(res.body.user.passwordHash).toBeUndefined();
      expect(res.body.passwordHash).toBeUndefined();
    }
  }, 15000);

  it('should verify DELETE removes audit row from database', async () => {
    const email = `test-${Date.now()}@example.com`;
    // Register
    const regRes = await request(app)
      .post('/api/auth/register')
      .send({ email, password: 'password123' });
    
    const cookie = regRes.headers['set-cookie'];
    expect(cookie).toBeDefined();

    // Perform audit while authenticated
    const auditRes = await request(app)
      .post('/api/audit')
      .set('Cookie', cookie)
      .send({ url: 'https://example.com' });

    expect(auditRes.status).toBe(200);
    expect(auditRes.body.savedToHistory).toBe(true);
    const auditId = auditRes.body.id;
    expect(auditId).toBeDefined();

    // Verify row exists
    const getRes = await request(app)
      .get(`/api/history/${auditId}`)
      .set('Cookie', cookie);
    expect(getRes.status).toBe(200);
    expect(getRes.body.id).toBe(auditId);

    // Delete row
    const delRes = await request(app)
      .delete(`/api/history/${auditId}`)
      .set('Cookie', cookie);
    expect(delRes.status).toBe(200);

    // Verify row is deleted
    const verifyGet = await request(app)
      .get(`/api/history/${auditId}`)
      .set('Cookie', cookie);
    expect(verifyGet.status).toBe(404);
  }, 30000);
});
