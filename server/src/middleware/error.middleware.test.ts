import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Request, Response, NextFunction } from 'express';
import { errorHandler } from './error.middleware';

function createMocks() {
  const req = {} as Request;
  const res = {
    status: vi.fn().mockReturnThis(),
    json: vi.fn().mockReturnThis(),
  } as unknown as Response;
  const next = vi.fn() as NextFunction;
  return { req, res, next };
}

describe('errorHandler middleware', () => {
  beforeEach(() => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  it('returns 500 with generic message for errors without status', () => {
    const { req, res, next } = createMocks();
    const err = new Error('something broke');

    errorHandler(err, req, res, next);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      status: 500,
      message: 'Internal server error',
    });
  });

  it('uses the error status when provided', () => {
    const { req, res, next } = createMocks();
    const err = Object.assign(new Error('Not found'), { status: 404 });

    errorHandler(err, req, res, next);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      status: 404,
      message: 'Not found',
    });
  });

  it('returns consistent { status, message } shape', () => {
    const { req, res, next } = createMocks();
    const err = Object.assign(new Error('Bad request'), { status: 400 });

    errorHandler(err, req, res, next);

    const body = (res.json as ReturnType<typeof vi.fn>).mock.calls[0][0];
    expect(body).toHaveProperty('status');
    expect(body).toHaveProperty('message');
    expect(typeof body.status).toBe('number');
    expect(typeof body.message).toBe('string');
  });

  it('never exposes stack traces in the response', () => {
    const { req, res, next } = createMocks();
    const err = new Error('oops');
    err.stack = 'Error: oops\n    at Object.<anonymous> (/app/src/index.ts:10:5)';

    errorHandler(err, req, res, next);

    const body = (res.json as ReturnType<typeof vi.fn>).mock.calls[0][0];
    expect(body).not.toHaveProperty('stack');
    expect(JSON.stringify(body)).not.toContain('at Object');
  });

  it('logs the error to console', () => {
    const { req, res, next } = createMocks();
    const err = new Error('log me');

    errorHandler(err, req, res, next);

    expect(console.error).toHaveBeenCalledWith(err);
  });

  it('defaults message to "Internal server error" for 500 errors even if error has a message', () => {
    const { req, res, next } = createMocks();
    const err = new Error('secret database connection string leaked');

    errorHandler(err, req, res, next);

    expect(res.json).toHaveBeenCalledWith({
      status: 500,
      message: 'Internal server error',
    });
  });
});
