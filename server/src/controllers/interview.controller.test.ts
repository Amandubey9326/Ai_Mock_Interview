import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { Request, Response, NextFunction } from 'express';
import {
  createInterview,
  listInterviews,
  getInterview,
  generateQuestion,
  submitAnswer,
} from './interview.controller';

vi.mock('../services/interview.service', () => ({
  createSession: vi.fn(),
  listUserInterviews: vi.fn(),
  getInterviewDetail: vi.fn(),
  generateQuestion: vi.fn(),
  submitAnswer: vi.fn(),
}));

import * as interviewService from '../services/interview.service';

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

describe('interview.controller', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('createInterview', () => {
    it('returns 201 with session id on valid input', async () => {
      vi.mocked(interviewService.createSession).mockResolvedValue({ id: 'interview-1' });
      const { req, res, next } = mockReqResNext({
        body: { role: 'Frontend', difficulty: 'Easy' },
      } as Partial<Request>);

      await createInterview(req, res, next);

      expect(interviewService.createSession).toHaveBeenCalledWith('user-1', 'Frontend', 'Easy');
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({ id: 'interview-1' });
      expect(next).not.toHaveBeenCalled();
    });

    it('returns 400 for invalid role', async () => {
      const { req, res, next } = mockReqResNext({
        body: { role: 'InvalidRole', difficulty: 'Easy' },
      } as Partial<Request>);

      await createInterview(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      const jsonCall = vi.mocked(res.json).mock.calls[0][0] as any;
      expect(jsonCall.status).toBe(400);
      expect(jsonCall.message).toBe('Validation failed');
      expect(jsonCall.errors).toBeInstanceOf(Array);
      expect(next).not.toHaveBeenCalled();
    });

    it('returns 400 for missing fields', async () => {
      const { req, res, next } = mockReqResNext({
        body: {},
      } as Partial<Request>);

      await createInterview(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      const jsonCall = vi.mocked(res.json).mock.calls[0][0] as any;
      expect(jsonCall.errors.length).toBeGreaterThan(0);
    });

    it('passes service errors to next()', async () => {
      const error = new Error('DB error');
      vi.mocked(interviewService.createSession).mockRejectedValue(error);
      const { req, res, next } = mockReqResNext({
        body: { role: 'Backend', difficulty: 'Hard' },
      } as Partial<Request>);

      await createInterview(req, res, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe('listInterviews', () => {
    it('returns 200 with paginated results using defaults', async () => {
      const mockResult = { interviews: [], total: 0 };
      vi.mocked(interviewService.listUserInterviews).mockResolvedValue(mockResult);
      const { req, res, next } = mockReqResNext();

      await listInterviews(req, res, next);

      expect(interviewService.listUserInterviews).toHaveBeenCalledWith('user-1', 1, 10);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockResult);
    });

    it('parses page and limit from query params', async () => {
      const mockResult = { interviews: [], total: 0 };
      vi.mocked(interviewService.listUserInterviews).mockResolvedValue(mockResult);
      const { req, res, next } = mockReqResNext({
        query: { page: '2', limit: '5' },
      } as Partial<Request>);

      await listInterviews(req, res, next);

      expect(interviewService.listUserInterviews).toHaveBeenCalledWith('user-1', 2, 5);
    });

    it('clamps page and limit to minimum 1', async () => {
      const mockResult = { interviews: [], total: 0 };
      vi.mocked(interviewService.listUserInterviews).mockResolvedValue(mockResult);
      const { req, res, next } = mockReqResNext({
        query: { page: '0', limit: '-1' },
      } as Partial<Request>);

      await listInterviews(req, res, next);

      expect(interviewService.listUserInterviews).toHaveBeenCalledWith('user-1', 1, 1);
    });

    it('passes service errors to next()', async () => {
      const error = new Error('DB error');
      vi.mocked(interviewService.listUserInterviews).mockRejectedValue(error);
      const { req, res, next } = mockReqResNext();

      await listInterviews(req, res, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe('getInterview', () => {
    it('returns 200 with interview detail', async () => {
      const mockInterview = { id: 'int-1', role: 'Frontend', questions: [] };
      vi.mocked(interviewService.getInterviewDetail).mockResolvedValue(mockInterview as any);
      const { req, res, next } = mockReqResNext({
        params: { id: 'int-1' },
      } as Partial<Request>);

      await getInterview(req, res, next);

      expect(interviewService.getInterviewDetail).toHaveBeenCalledWith('int-1');
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockInterview);
    });

    it('passes service errors to next()', async () => {
      const error = new Error('Interview not found');
      (error as any).status = 404;
      vi.mocked(interviewService.getInterviewDetail).mockRejectedValue(error);
      const { req, res, next } = mockReqResNext({
        params: { id: 'nonexistent' },
      } as Partial<Request>);

      await getInterview(req, res, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe('generateQuestion', () => {
    it('returns 200 with generated question', async () => {
      const mockQuestion = { id: 'q-1', interviewId: 'int-1', question: 'What is React?' };
      vi.mocked(interviewService.generateQuestion).mockResolvedValue(mockQuestion);
      const { req, res, next } = mockReqResNext({
        params: { id: 'int-1' },
      } as Partial<Request>);

      await generateQuestion(req, res, next);

      expect(interviewService.generateQuestion).toHaveBeenCalledWith('int-1');
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockQuestion);
    });

    it('passes service errors to next()', async () => {
      const error = new Error('Interview not found');
      (error as any).status = 404;
      vi.mocked(interviewService.generateQuestion).mockRejectedValue(error);
      const { req, res, next } = mockReqResNext({
        params: { id: 'nonexistent' },
      } as Partial<Request>);

      await generateQuestion(req, res, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe('submitAnswer', () => {
    it('returns 200 with evaluation result on valid input', async () => {
      const mockResult = {
        id: 'q-1',
        question: 'What is React?',
        userAnswer: 'A library',
        score: 7,
        aiFeedback: { strengths: [], weaknesses: [], improvements: [] },
      };
      vi.mocked(interviewService.submitAnswer).mockResolvedValue(mockResult);
      const { req, res, next } = mockReqResNext({
        params: { id: 'int-1', qid: 'q-1' },
        body: { answer: 'A library' },
      } as Partial<Request>);

      await submitAnswer(req, res, next);

      expect(interviewService.submitAnswer).toHaveBeenCalledWith('q-1', 'A library');
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(mockResult);
    });

    it('returns 400 for empty answer', async () => {
      const { req, res, next } = mockReqResNext({
        params: { id: 'int-1', qid: 'q-1' },
        body: { answer: '' },
      } as Partial<Request>);

      await submitAnswer(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      const jsonCall = vi.mocked(res.json).mock.calls[0][0] as any;
      expect(jsonCall.status).toBe(400);
      expect(jsonCall.message).toBe('Validation failed');
    });

    it('returns 400 for missing answer field', async () => {
      const { req, res, next } = mockReqResNext({
        params: { id: 'int-1', qid: 'q-1' },
        body: {},
      } as Partial<Request>);

      await submitAnswer(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
    });

    it('passes service errors to next()', async () => {
      const error = new Error('Question not found');
      (error as any).status = 404;
      vi.mocked(interviewService.submitAnswer).mockRejectedValue(error);
      const { req, res, next } = mockReqResNext({
        params: { id: 'int-1', qid: 'q-1' },
        body: { answer: 'Some answer' },
      } as Partial<Request>);

      await submitAnswer(req, res, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });
});
