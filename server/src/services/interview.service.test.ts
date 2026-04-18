import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../lib/prisma', () => ({
  default: {
    interview: {
      create: vi.fn(),
      findUnique: vi.fn(),
      findMany: vi.fn(),
      count: vi.fn(),
    },
    interviewQuestion: {
      create: vi.fn(),
      findUnique: vi.fn(),
      update: vi.fn(),
    },
  },
}));

vi.mock('./ai.service', () => ({
  generateQuestion: vi.fn(),
  evaluateAnswer: vi.fn(),
}));

import prisma from '../lib/prisma';
import * as aiService from './ai.service';
import {
  createSession,
  generateQuestion,
  submitAnswer,
  listUserInterviews,
  getInterviewDetail,
} from './interview.service';

const mockInterview = {
  id: 'int-001',
  userId: 'user-001',
  role: 'Backend' as const,
  difficulty: 'Medium' as const,
  createdAt: new Date('2024-01-01'),
};

const mockQuestion = {
  id: 'q-001',
  interviewId: 'int-001',
  question: 'What is REST?',
  userAnswer: null,
  aiFeedback: null,
  score: null,
};

describe('interview.service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('createSession', () => {
    it('creates an interview and returns the session id', async () => {
      vi.mocked(prisma.interview.create).mockResolvedValue(mockInterview);

      const result = await createSession('user-001', 'Backend', 'Medium');

      expect(prisma.interview.create).toHaveBeenCalledWith({
        data: { userId: 'user-001', role: 'Backend', difficulty: 'Medium' },
      });
      expect(result).toEqual({ id: 'int-001' });
    });
  });

  describe('generateQuestion', () => {
    it('fetches interview, calls AI, creates question record', async () => {
      vi.mocked(prisma.interview.findUnique).mockResolvedValue(mockInterview);
      vi.mocked(aiService.generateQuestion).mockResolvedValue({ question: 'What is REST?' });
      vi.mocked(prisma.interviewQuestion.create).mockResolvedValue(mockQuestion);

      const result = await generateQuestion('int-001');

      expect(prisma.interview.findUnique).toHaveBeenCalledWith({ where: { id: 'int-001' } });
      expect(aiService.generateQuestion).toHaveBeenCalledWith('Backend', 'Medium');
      expect(prisma.interviewQuestion.create).toHaveBeenCalledWith({
        data: { interviewId: 'int-001', question: 'What is REST?' },
      });
      expect(result).toEqual({
        id: 'q-001',
        interviewId: 'int-001',
        question: 'What is REST?',
      });
    });

    it('throws 404 when interview not found', async () => {
      vi.mocked(prisma.interview.findUnique).mockResolvedValue(null);

      await expect(generateQuestion('nonexistent')).rejects.toMatchObject({
        message: 'Interview not found',
        status: 404,
      });
    });
  });

  describe('submitAnswer', () => {
    it('fetches question, calls AI evaluation, updates record', async () => {
      vi.mocked(prisma.interviewQuestion.findUnique).mockResolvedValue({
        ...mockQuestion,
        interview: mockInterview,
      } as any);
      vi.mocked(aiService.evaluateAnswer).mockResolvedValue({
        score: 8,
        strengths: ['Good'],
        weaknesses: ['Vague'],
        improvements: ['Be specific'],
      });
      vi.mocked(prisma.interviewQuestion.update).mockResolvedValue({
        ...mockQuestion,
        userAnswer: 'REST is an architectural style',
        aiFeedback: { strengths: ['Good'], weaknesses: ['Vague'], improvements: ['Be specific'] },
        score: 8,
      });

      const result = await submitAnswer('q-001', 'REST is an architectural style');

      expect(prisma.interviewQuestion.findUnique).toHaveBeenCalledWith({
        where: { id: 'q-001' },
        include: { interview: true },
      });
      expect(aiService.evaluateAnswer).toHaveBeenCalledWith('What is REST?', 'REST is an architectural style');
      expect(prisma.interviewQuestion.update).toHaveBeenCalledWith({
        where: { id: 'q-001' },
        data: {
          userAnswer: 'REST is an architectural style',
          aiFeedback: { strengths: ['Good'], weaknesses: ['Vague'], improvements: ['Be specific'] },
          score: 8,
        },
      });
      expect(result.score).toBe(8);
      expect(result.userAnswer).toBe('REST is an architectural style');
    });

    it('throws 404 when question not found', async () => {
      vi.mocked(prisma.interviewQuestion.findUnique).mockResolvedValue(null);

      await expect(submitAnswer('nonexistent', 'answer')).rejects.toMatchObject({
        message: 'Question not found',
        status: 404,
      });
    });
  });

  describe('listUserInterviews', () => {
    it('returns paginated interviews with total count', async () => {
      const interviews = [mockInterview];
      vi.mocked(prisma.interview.findMany).mockResolvedValue(interviews);
      vi.mocked(prisma.interview.count).mockResolvedValue(1);

      const result = await listUserInterviews('user-001', 1, 10);

      expect(prisma.interview.findMany).toHaveBeenCalledWith({
        where: { userId: 'user-001' },
        orderBy: { createdAt: 'desc' },
        skip: 0,
        take: 10,
      });
      expect(prisma.interview.count).toHaveBeenCalledWith({ where: { userId: 'user-001' } });
      expect(result).toEqual({ interviews, total: 1 });
    });

    it('calculates correct skip for page 2', async () => {
      vi.mocked(prisma.interview.findMany).mockResolvedValue([]);
      vi.mocked(prisma.interview.count).mockResolvedValue(0);

      await listUserInterviews('user-001', 2, 5);

      expect(prisma.interview.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ skip: 5, take: 5 })
      );
    });
  });

  describe('getInterviewDetail', () => {
    it('returns interview with questions included', async () => {
      const interviewWithQuestions = { ...mockInterview, questions: [mockQuestion] };
      vi.mocked(prisma.interview.findUnique).mockResolvedValue(interviewWithQuestions as any);

      const result = await getInterviewDetail('int-001');

      expect(prisma.interview.findUnique).toHaveBeenCalledWith({
        where: { id: 'int-001' },
        include: { questions: true },
      });
      expect(result.questions).toHaveLength(1);
      expect(result.questions[0].question).toBe('What is REST?');
    });

    it('throws 404 when interview not found', async () => {
      vi.mocked(prisma.interview.findUnique).mockResolvedValue(null);

      await expect(getInterviewDetail('nonexistent')).rejects.toMatchObject({
        message: 'Interview not found',
        status: 404,
      });
    });
  });
});
