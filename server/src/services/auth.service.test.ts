import { describe, it, expect, vi, beforeEach } from 'vitest';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

// Mock prisma
vi.mock('../lib/prisma', () => ({
  default: {
    user: {
      findUnique: vi.fn(),
      create: vi.fn(),
    },
  },
}));

// Mock config
vi.mock('../config', () => ({
  config: {
    jwtSecret: 'test-secret',
    jwtExpiresIn: '7d',
  },
}));

import prisma from '../lib/prisma';
import { register, login } from './auth.service';

const mockUser = {
  id: '123e4567-e89b-12d3-a456-426614174000',
  name: 'Test User',
  email: 'test@example.com',
  password: '$2b$10$hashedpassword',
  createdAt: new Date('2024-01-01'),
};

describe('auth.service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('register', () => {
    it('creates a user with hashed password and returns AuthResponse', async () => {
      vi.mocked(prisma.user.findUnique).mockResolvedValue(null);
      vi.mocked(prisma.user.create).mockResolvedValue(mockUser);

      const result = await register({
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123',
      });

      expect(result.token).toBeTruthy();
      expect(result.user).toEqual({
        id: mockUser.id,
        name: mockUser.name,
        email: mockUser.email,
        createdAt: mockUser.createdAt,
      });
      expect(result.user).not.toHaveProperty('password');

      // Verify bcrypt was used (password in create call should not be plaintext)
      const createCall = vi.mocked(prisma.user.create).mock.calls[0][0];
      expect(createCall.data.password).not.toBe('password123');
    });

    it('throws 409 when email already exists', async () => {
      vi.mocked(prisma.user.findUnique).mockResolvedValue(mockUser);

      await expect(
        register({
          name: 'Test User',
          email: 'test@example.com',
          password: 'password123',
        })
      ).rejects.toMatchObject({
        message: 'Email already exists',
        status: 409,
      });
    });
  });

  describe('login', () => {
    it('returns AuthResponse for valid credentials', async () => {
      const hashed = await bcrypt.hash('password123', 10);
      vi.mocked(prisma.user.findUnique).mockResolvedValue({
        ...mockUser,
        password: hashed,
      });

      const result = await login({
        email: 'test@example.com',
        password: 'password123',
      });

      expect(result.token).toBeTruthy();
      expect(result.user).toEqual({
        id: mockUser.id,
        name: mockUser.name,
        email: mockUser.email,
        createdAt: mockUser.createdAt,
      });
      expect(result.user).not.toHaveProperty('password');
    });

    it('throws 401 when email does not exist', async () => {
      vi.mocked(prisma.user.findUnique).mockResolvedValue(null);

      await expect(
        login({ email: 'nobody@example.com', password: 'password123' })
      ).rejects.toMatchObject({
        message: 'Invalid credentials',
        status: 401,
      });
    });

    it('throws 401 when password is incorrect', async () => {
      const hashed = await bcrypt.hash('correctpassword', 10);
      vi.mocked(prisma.user.findUnique).mockResolvedValue({
        ...mockUser,
        password: hashed,
      });

      await expect(
        login({ email: 'test@example.com', password: 'wrongpassword' })
      ).rejects.toMatchObject({
        message: 'Invalid credentials',
        status: 401,
      });
    });

    it('generates a valid JWT token', async () => {
      const hashed = await bcrypt.hash('password123', 10);
      vi.mocked(prisma.user.findUnique).mockResolvedValue({
        ...mockUser,
        password: hashed,
      });

      const result = await login({
        email: 'test@example.com',
        password: 'password123',
      });

      const decoded = jwt.verify(result.token, 'test-secret') as jwt.JwtPayload;
      expect(decoded.id).toBe(mockUser.id);
      expect(decoded.email).toBe(mockUser.email);
      expect(decoded.exp).toBeDefined();
    });
  });
});
