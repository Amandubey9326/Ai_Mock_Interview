import { describe, it, expect, vi } from 'vitest';

vi.mock('../lib/prisma', () => ({
  default: {
    user: { findUnique: vi.fn(), create: vi.fn() },
  },
}));

vi.mock('../config', () => ({
  config: { jwtSecret: 'test', jwtExpiresIn: '7d' },
}));

import authRouter from './auth.routes';

describe('auth.routes', () => {
  it('exports an Express router', () => {
    expect(authRouter).toBeDefined();
    expect(typeof authRouter).toBe('function');
  });

  it('has POST /register route', () => {
    const routes = (authRouter as any).stack
      .filter((layer: any) => layer.route)
      .map((layer: any) => ({
        path: layer.route.path,
        methods: Object.keys(layer.route.methods),
      }));

    const registerRoute = routes.find((r: any) => r.path === '/register');
    expect(registerRoute).toBeDefined();
    expect(registerRoute.methods).toContain('post');
  });

  it('has POST /login route', () => {
    const routes = (authRouter as any).stack
      .filter((layer: any) => layer.route)
      .map((layer: any) => ({
        path: layer.route.path,
        methods: Object.keys(layer.route.methods),
      }));

    const loginRoute = routes.find((r: any) => r.path === '/login');
    expect(loginRoute).toBeDefined();
    expect(loginRoute.methods).toContain('post');
  });
});
