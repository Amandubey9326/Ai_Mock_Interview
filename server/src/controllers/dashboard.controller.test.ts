import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { Request, Response, NextFunction } from 'express';
import { getDashboard } from './dashboard.controller';

vi.mock('../services/dashboard.service', () => ({
  getDashboardData: vi.fn(),
}));

import * as dashboardService from '../services/dashboard.service';

function mockReqResNext(overrides: Partial<Request> = {}) {
  const req = {
    body: {},
    params: {},
    query: {},
    user: { id: 'user-1', email: 'test@example.com' },
    ...overrides,
  } as unknown as Request;
  const res = {
    status: vi.fn().mockReturnThis(),
    json: vi.fn().mockReturnThis(),
  } as unknown as Response;
  const next = vi.fn() as NextFunction;
  return { req, res, next };
}

describe('dashboard.controller', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns 200 with dashboard data', async () => {
    const mockData = {
      totalSessions: 5,
      averageScore: 7.2,
      recentSessions: [],
      scoreOverTime: [],
    };
    vi.mocked(dashboardService.getDashboardData).mockResolvedValue(mockData);
    const { req, res, next } = mockReqResNext();

    await getDashboard(req, res, next);

    expect(dashboardService.getDashboardData).toHaveBeenCalledWith('user-1');
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(mockData);
  });

  it('passes service errors to next()', async () => {
    const error = new Error('DB error');
    vi.mocked(dashboardService.getDashboardData).mockRejectedValue(error);
    const { req, res, next } = mockReqResNext();

    await getDashboard(req, res, next);

    expect(next).toHaveBeenCalledWith(error);
  });
});
