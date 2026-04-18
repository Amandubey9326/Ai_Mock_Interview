import { Request, Response, NextFunction } from 'express';

interface AppError extends Error {
  status?: number;
}

export function errorHandler(
  err: AppError,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  const status = typeof err.status === 'number' ? err.status : 500;
  const message = status === 500 ? 'Internal server error' : err.message || 'Internal server error';

  console.error(err);

  res.status(status).json({ status, message });
}
