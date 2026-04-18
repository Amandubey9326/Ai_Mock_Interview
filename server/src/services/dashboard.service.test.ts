import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../lib/prisma', () => ({
  default: {
    interview: {
      count: vi.fn(),
      findMany: vi.fn(),
    },
    interviewQuestion: {
      aggregate: vi.fn(),
      findMany: vi.fn(),
    },
  },
}));

import prisma from '../lib/prisma';
import { getDashboardData } from './dashboard.service';

describe('dashboard.service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns zeros and empty arrays when user has no data', async () => {
    vi.mocked(prisma.interview.count).mockResolvedValue(0);
    vi.mocked(prisma.interviewQuestion.aggregate).mockResolvedValue({
      _avg: { score: null },
      _count: { score: 0 },
      _sum: { score: null },
      _min: { score: null },
      _max: { score: null },
    } as any);
    vi.mocked(prisma.interview.findMany).mockResolvedValue([]);
    vi.mocked(prisma.interviewQuestion.findMany).mockResolvedValue([]);

    const result = await getDashboardData('user-1');

    expect(result.totalSessions).toBe(0);
    expect(result.averageScore).toBe(0);
    expect(result.recentSessions).toEqual([]);
    expect(result.scoreOverTime).toEqual([]);
  });

  it('returns correct metrics when user has interview data', async () => {
    vi.mocked(prisma.interview.count).mockResolvedValue(3);
    vi.mocked(prisma.interviewQuestion.aggregate).mockResolvedValue({
      _avg: { score: 7.5 },
    } as any);
    vi.mocked(prisma.interview.findMany).mockResolvedValue([
      { id: 'int-1', role: 'Frontend', difficulty: 'Easy', createdAt: new Date('2024-01-03') },
      { id: 'int-2', role: 'Backend', difficulty: 'Medium', createdAt: new Date('2024-01-02') },
    ] as any);
    vi.mocked(prisma.interviewQuestion.findMany).mockResolvedValue([
      { score: 8, interview: { createdAt: new Date('2024-01-01') } },
      { score: 6, interview: { createdAt: new Date('2024-01-01') } },
      { score: 9, interview: { createdAt: new Date('2024-01-02') } },
    ] as any);

    const result = await getDashboardData('user-1');

    expect(result.totalSessions).toBe(3);
    expect(result.averageScore).toBe(7.5);
    expect(result.recentSessions).toHaveLength(2);
    expect(result.scoreOverTime).toHaveLength(2);
    expect(result.scoreOverTime[0]).toEqual({ date: '2024-01-01', averageScore: 7 });
    expect(result.scoreOverTime[1]).toEqual({ date: '2024-01-02', averageScore: 9 });
  });

  it('queries with correct userId filter', async () => {
    vi.mocked(prisma.interview.count).mockResolvedValue(0);
    vi.mocked(prisma.interviewQuestion.aggregate).mockResolvedValue({ _avg: { score: null } } as any);
    vi.mocked(prisma.interview.findMany).mockResolvedValue([]);
    vi.mocked(prisma.interviewQuestion.findMany).mockResolvedValue([]);

    await getDashboardData('user-42');

    expect(prisma.interview.count).toHaveBeenCalledWith({ where: { userId: 'user-42' } });
    expect(prisma.interview.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { userId: 'user-42' },
        orderBy: { createdAt: 'desc' },
        take: 5,
      })
    );
  });
});
