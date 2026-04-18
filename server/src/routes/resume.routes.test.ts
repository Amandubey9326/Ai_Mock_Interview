import { describe, it, expect, vi } from 'vitest';

vi.mock('../lib/prisma', () => ({
  default: {},
}));

vi.mock('../config', () => ({
  config: { jwtSecret: 'test', jwtExpiresIn: '7d' },
}));

vi.mock('pdf-parse', () => ({
  default: vi.fn(),
}));

vi.mock('../services/ai.service', () => ({
  analyzeResume: vi.fn(),
}));

import resumeRouter from './resume.routes';

describe('resume.routes', () => {
  it('exports an Express router', () => {
    expect(resumeRouter).toBeDefined();
    expect(typeof resumeRouter).toBe('function');
  });

  const routes = (resumeRouter as any).stack
    .filter((layer: any) => layer.route)
    .map((layer: any) => ({
      path: layer.route.path,
      methods: Object.keys(layer.route.methods),
    }));

  it('has POST /analyze route', () => {
    const route = routes.find((r: any) => r.path === '/analyze' && r.methods.includes('post'));
    expect(route).toBeDefined();
  });

  it('applies authMiddleware to all routes', () => {
    const middlewareLayers = (resumeRouter as any).stack.filter(
      (layer: any) => !layer.route && layer.name === 'authMiddleware'
    );
    expect(middlewareLayers.length).toBeGreaterThan(0);
  });
});
