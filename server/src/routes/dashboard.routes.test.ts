import { describe, it, expect, vi } from 'vitest';

vi.mock('../lib/prisma', () => ({
  default: {
    interview: { count: vi.fn(), findMany: vi.fn() },
    interviewQuestion: { aggregate: vi.fn(), findMany: vi.fn() },
  },
}));

vi.mock('../config', () => ({
  config: { jwtSecret: 'test', jwtExpiresIn: '7d' },
}));

import dashboardRouter from './dashboard.routes';

describe('dashboard.routes', () => {
  it('exports an Express router', () => {
    expect(dashboardRouter).toBeDefined();
    expect(typeof dashboardRouter).toBe('function');
  });

  const routes = (dashboardRouter as any).stack
    .filter((layer: any) => layer.route)
    .map((layer: any) => ({
      path: layer.route.path,
      methods: Object.keys(layer.route.methods),
    }));

  it('has GET / route for dashboard data', () => {
    const route = routes.find((r: any) => r.path === '/' && r.methods.includes('get'));
    expect(route).toBeDefined();
  });

  it('applies authMiddleware to all routes', () => {
    const middlewareLayers = (dashboardRouter as any).stack.filter(
      (layer: any) => !layer.route && layer.name === 'authMiddleware'
    );
    expect(middlewareLayers.length).toBeGreaterThan(0);
  });
});
