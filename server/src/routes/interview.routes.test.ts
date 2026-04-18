import { describe, it, expect, vi } from 'vitest';

vi.mock('../lib/prisma', () => ({
  default: {
    interview: { findMany: vi.fn(), findUnique: vi.fn(), create: vi.fn(), count: vi.fn() },
    interviewQuestion: { findUnique: vi.fn(), create: vi.fn(), update: vi.fn() },
  },
}));

vi.mock('../config', () => ({
  config: { jwtSecret: 'test', jwtExpiresIn: '7d' },
}));

vi.mock('../services/ai.service', () => ({
  generateQuestion: vi.fn(),
  evaluateAnswer: vi.fn(),
}));

import interviewRouter from './interview.routes';

describe('interview.routes', () => {
  it('exports an Express router', () => {
    expect(interviewRouter).toBeDefined();
    expect(typeof interviewRouter).toBe('function');
  });

  const routes = (interviewRouter as any).stack
    .filter((layer: any) => layer.route)
    .map((layer: any) => ({
      path: layer.route.path,
      methods: Object.keys(layer.route.methods),
    }));

  it('has POST / route for creating interviews', () => {
    const route = routes.find((r: any) => r.path === '/' && r.methods.includes('post'));
    expect(route).toBeDefined();
  });

  it('has GET / route for listing interviews', () => {
    const route = routes.find((r: any) => r.path === '/' && r.methods.includes('get'));
    expect(route).toBeDefined();
  });

  it('has GET /:id route for interview detail', () => {
    const route = routes.find((r: any) => r.path === '/:id' && r.methods.includes('get'));
    expect(route).toBeDefined();
  });

  it('has POST /:id/questions route for generating questions', () => {
    const route = routes.find((r: any) => r.path === '/:id/questions' && r.methods.includes('post'));
    expect(route).toBeDefined();
  });

  it('has POST /:id/questions/:qid/answer route for submitting answers', () => {
    const route = routes.find((r: any) => r.path === '/:id/questions/:qid/answer' && r.methods.includes('post'));
    expect(route).toBeDefined();
  });

  it('applies authMiddleware to all routes', () => {
    const middlewareLayers = (interviewRouter as any).stack.filter(
      (layer: any) => !layer.route && layer.name === 'authMiddleware'
    );
    expect(middlewareLayers.length).toBeGreaterThan(0);
  });
});
