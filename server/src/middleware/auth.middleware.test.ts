import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

// Mock config before importing middleware
vi.mock('../config', () => ({
  config: {
    jwtSecret: 'test-secret',
    jwtExpiresIn: '7d',
  },
}));

import { authMiddleware } from './auth.middleware';

function createMockReqRes(authHeader?: string) {
  const req = {
    headers: {
      authorization: authHeader,
    },
  } as unknown as Request;

  const res = {
    status: vi.fn().mockReturnThis(),
    json: vi.fn().mockReturnThis(),
  } as unknown as Response;

  const next = vi.fn() as NextFunction;

  return { req, res, next };
}

describe('authMiddleware', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should call next and attach user for a valid token', () => {
    const token = jwt.sign({ id: 'user-1', email: 'test@example.com' }, 'test-secret');
    const { req, res, next } = createMockReqRes(`Bearer ${token}`);

    authMiddleware(req, res, next);

    expect(next).toHaveBeenCalled();
    expect(req.user).toEqual({ id: 'user-1', email: 'test@example.com' });
    expect(res.status).not.toHaveBeenCalled();
  });

  it('should return 401 when no Authorization header is present', () => {
    const { req, res, next } = createMockReqRes(undefined);

    authMiddleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ status: 401, message: 'Unauthorized' });
    expect(next).not.toHaveBeenCalled();
  });

  it('should return 401 when Authorization header does not start with Bearer', () => {
    const { req, res, next } = createMockReqRes('Basic abc123');

    authMiddleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ status: 401, message: 'Unauthorized' });
    expect(next).not.toHaveBeenCalled();
  });

  it('should return 401 for an expired token', () => {
    const token = jwt.sign(
      { id: 'user-1', email: 'test@example.com' },
      'test-secret',
      { expiresIn: '0s' }
    );
    // Token is already expired at creation with 0s
    const { req, res, next } = createMockReqRes(`Bearer ${token}`);

    authMiddleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ status: 401, message: 'Unauthorized' });
    expect(next).not.toHaveBeenCalled();
  });

  it('should return 401 for a malformed token', () => {
    const { req, res, next } = createMockReqRes('Bearer not-a-valid-jwt');

    authMiddleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ status: 401, message: 'Unauthorized' });
    expect(next).not.toHaveBeenCalled();
  });

  it('should return 401 for a token signed with a different secret', () => {
    const token = jwt.sign({ id: 'user-1', email: 'test@example.com' }, 'wrong-secret');
    const { req, res, next } = createMockReqRes(`Bearer ${token}`);

    authMiddleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ status: 401, message: 'Unauthorized' });
    expect(next).not.toHaveBeenCalled();
  });

  it('should return 401 for an empty Bearer token', () => {
    const { req, res, next } = createMockReqRes('Bearer ');

    authMiddleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });
});
