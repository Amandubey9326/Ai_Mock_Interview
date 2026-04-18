import { describe, it, expect } from 'vitest';
import { registerInputSchema, loginInputSchema } from './auth.validator';

describe('registerInputSchema', () => {
  it('accepts valid registration input', () => {
    const result = registerInputSchema.safeParse({
      name: 'John Doe',
      email: 'john@example.com',
      password: 'secret123',
    });
    expect(result.success).toBe(true);
  });

  it('rejects empty name', () => {
    const result = registerInputSchema.safeParse({
      name: '',
      email: 'john@example.com',
      password: 'secret123',
    });
    expect(result.success).toBe(false);
  });

  it('rejects invalid email', () => {
    const result = registerInputSchema.safeParse({
      name: 'John',
      email: 'not-an-email',
      password: 'secret123',
    });
    expect(result.success).toBe(false);
  });

  it('rejects password shorter than 6 characters', () => {
    const result = registerInputSchema.safeParse({
      name: 'John',
      email: 'john@example.com',
      password: '12345',
    });
    expect(result.success).toBe(false);
  });

  it('accepts password of exactly 6 characters', () => {
    const result = registerInputSchema.safeParse({
      name: 'John',
      email: 'john@example.com',
      password: '123456',
    });
    expect(result.success).toBe(true);
  });

  it('rejects missing fields', () => {
    const result = registerInputSchema.safeParse({});
    expect(result.success).toBe(false);
  });
});

describe('loginInputSchema', () => {
  it('accepts valid login input', () => {
    const result = loginInputSchema.safeParse({
      email: 'john@example.com',
      password: 'secret123',
    });
    expect(result.success).toBe(true);
  });

  it('rejects invalid email', () => {
    const result = loginInputSchema.safeParse({
      email: 'bad-email',
      password: 'secret123',
    });
    expect(result.success).toBe(false);
  });

  it('rejects empty password', () => {
    const result = loginInputSchema.safeParse({
      email: 'john@example.com',
      password: '',
    });
    expect(result.success).toBe(false);
  });

  it('rejects missing fields', () => {
    const result = loginInputSchema.safeParse({});
    expect(result.success).toBe(false);
  });
});
