import { describe, it, expect, vi } from 'vitest';

vi.mock('./lib/prisma', () => ({
  default: {
    user: { findUnique: vi.fn(), create: vi.fn() },
    interview: { create: vi.fn(), findUnique: vi.fn(), findMany: vi.fn(), count: vi.fn() },
    interviewQuestion: { create: vi.fn(), findUnique: vi.fn(), update: vi.fn(), aggregate: vi.fn(), findMany: vi.fn() },
  },
}));

vi.mock('./config', () => ({
  config: { jwtSecret: 'test-secret', jwtExpiresIn: '7d', port: 5000 },
}));

vi.mock('./services/ai.service', () => ({
  generateQuestion: vi.fn(),
  evaluateAnswer: vi.fn(),
  analyzeResume: vi.fn(),
}));

vi.mock('pdf-parse', () => ({
  default: vi.fn(),
}));

import request from 'supertest';
import app from './app';

describe('Express app setup', () => {
  it('exports an Express app', () => {
    expect(app).toBeDefined();
    expect(typeof app.listen).toBe('function');
  });

  it('mounts auth routes at /api/auth', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'test@example.com', password: 'password123' });

    expect(res.status).not.toBe(404);
  });

  it('mounts interview routes at /api/interviews', async () => {
    const res = await request(app).get('/api/interviews');
    // Should reach the route (not 404), even if auth fails with 401
    expect(res.status).not.toBe(404);
  });

  it('mounts dashboard routes at /api/dashboard', async () => {
    const res = await request(app).get('/api/dashboard');
    expect(res.status).not.toBe(404);
  });

  it('mounts resume routes at /api/resume', async () => {
    const res = await request(app).post('/api/resume/analyze');
    expect(res.status).not.toBe(404);
  });

  it('parses JSON request bodies', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'test@example.com', password: 'password123' })
      .set('Content-Type', 'application/json');

    expect(res.status).not.toBe(415);
  });

  it('returns 404 for unknown routes', async () => {
    const res = await request(app).get('/api/unknown');
    expect(res.status).toBe(404);
  });

  it('includes CORS headers', async () => {
    const res = await request(app)
      .options('/api/auth/login')
      .set('Origin', 'http://localhost:3000');

    expect(res.headers['access-control-allow-origin']).toBeDefined();
  });
});
