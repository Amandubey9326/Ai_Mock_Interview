import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { Request, Response, NextFunction } from 'express';
import { register, login } from './auth.controller';

// Mock auth service
vi.mock('../services/auth.service', () => ({
  register: vi.fn(),
  login: vi.fn(),
}));

import * as authService from '../services/auth.service';

function mockReqResNext(body: any = {}) {
  const req = { body } as Request;
  const res = {
    status: vi.fn().mockReturnThis(),
    json: vi.fn().mockReturnThis(),
  } as unknown as Response;
  const next = vi.fn() as NextFunction;
  return { req, res, next };
}

const mockAuthResponse = {
  token: 'jwt-token',
  user: {
    id: '123',
    name: 'Test User',
    email: 'test@example.com',
    createdAt: new Date('2024-01-01'),
  },
};

describe('auth.controller', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('register', () => {
    it('returns 201 with AuthResponse on valid input', async () => {
      vi.mocked(authService.register).mockResolvedValue(mockAuthResponse);
      const { req, res, next } = mockReqResNext({
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123',
      });

      await register(req, res, next);

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(mockAuthResponse);
      expect(next).not.toHaveBeenCalled();
    });

    it('returns 400 with validation errors for invalid input', async () => {
      const { req, res, next } = mockReqResNext({
        name: '',
        email: 'not-an-email',
        password: '12',
      });

      await register(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      const jsonCall = vi.mocked(res.json).mock.calls[0][0] as any;
      expect(jsonCall.status).toBe(400);
      expect(jsonCall.message).toBe('Validation failed');
      expect(jsonCall.errors).toBeInstanceOf(Array);
      expect(jsonCall.errors.length).toBeGreaterThan(0);
      expect(jsonCall.errors[0]).toHaveProperty('field');
      expect(jsonCall.errors[0]).toHaveProperty('message');
      expect(next).not.toHaveBeenCalled();
    });

    it('returns 400 with field-specific error for missing email', async () => {
      const { req, res, next } = mockReqResNext({
        name: 'Test',
        password: 'password123',
      });

      await register(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      const jsonCall = vi.mocked(res.json).mock.calls[0][0] as any;
      const emailError = jsonCall.errors.find((e: any) => e.field === 'email');
      expect(emailError).toBeDefined();
    });

    it('passes service errors to next()', async () => {
      const error = new Error('Email already exists');
      (error as any).status = 409;
      vi.mocked(authService.register).mockRejectedValue(error);
      const { req, res, next } = mockReqResNext({
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123',
      });

      await register(req, res, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe('login', () => {
    it('returns 200 with AuthResponse on valid input', async () => {
      vi.mocked(authService.login).mockResolvedValue(mockAuthResponse);
      const { req, res, next } = mockReqResNext({
        email: 'test@example.com',
        password: 'password123',
      });

      await login(req, res, next);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockAuthResponse);
      expect(next).not.toHaveBeenCalled();
    });

    it('returns 400 with validation errors for invalid input', async () => {
      const { req, res, next } = mockReqResNext({
        email: 'bad-email',
        password: '',
      });

      await login(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      const jsonCall = vi.mocked(res.json).mock.calls[0][0] as any;
      expect(jsonCall.status).toBe(400);
      expect(jsonCall.message).toBe('Validation failed');
      expect(jsonCall.errors).toBeInstanceOf(Array);
    });

    it('passes service errors to next()', async () => {
      const error = new Error('Invalid credentials');
      (error as any).status = 401;
      vi.mocked(authService.login).mockRejectedValue(error);
      const { req, res, next } = mockReqResNext({
        email: 'test@example.com',
        password: 'password123',
      });

      await login(req, res, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });
});
