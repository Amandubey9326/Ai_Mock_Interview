import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { Request, Response, NextFunction } from 'express';
import { analyzeResume } from './resume.controller';

vi.mock('../services/resume.service', () => ({
  analyzeResume: vi.fn(),
}));

import * as resumeService from '../services/resume.service';

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

describe('resume.controller', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns 400 when no file is uploaded', async () => {
    const { req, res, next } = mockReqResNext();

    await analyzeResume(req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ status: 400, message: 'No file uploaded' });
  });

  it('returns 400 when file is not a PDF', async () => {
    const { req, res, next } = mockReqResNext({
      file: { mimetype: 'image/png', buffer: Buffer.from('data') } as any,
    } as Partial<Request>);

    await analyzeResume(req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ status: 400, message: 'Only PDF files are allowed' });
  });

  it('returns 200 with analysis result for valid PDF', async () => {
    const mockResult = {
      strengths: ['Good'],
      weaknesses: ['Bad'],
      missing_skills: ['Docker'],
      suggestions: ['Learn Docker'],
    };
    vi.mocked(resumeService.analyzeResume).mockResolvedValue(mockResult);
    const { req, res, next } = mockReqResNext({
      file: { mimetype: 'application/pdf', buffer: Buffer.from('pdf-data') } as any,
    } as Partial<Request>);

    await analyzeResume(req, res, next);

    expect(resumeService.analyzeResume).toHaveBeenCalledWith(Buffer.from('pdf-data'));
    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(mockResult);
  });

  it('passes service errors to next()', async () => {
    const error = new Error('AI error');
    vi.mocked(resumeService.analyzeResume).mockRejectedValue(error);
    const { req, res, next } = mockReqResNext({
      file: { mimetype: 'application/pdf', buffer: Buffer.from('pdf-data') } as any,
    } as Partial<Request>);

    await analyzeResume(req, res, next);

    expect(next).toHaveBeenCalledWith(error);
  });
});
