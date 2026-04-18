import prisma from '../lib/prisma';

export async function getDashboardData(userId: string) {
  const [totalSessions, scoreAgg, recentSessions, scoredQuestions] = await Promise.all([
    prisma.interview.count({ where: { userId } }),

    prisma.interviewQuestion.aggregate({
      _avg: { score: true },
      where: {
        interview: { userId },
        score: { not: null },
      },
    }),

    prisma.interview.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 5,
      select: {
        id: true,
        role: true,
        difficulty: true,
        createdAt: true,
      },
    }),

    prisma.interviewQuestion.findMany({
      where: {
        interview: { userId },
        score: { not: null },
      },
      select: {
        score: true,
        interview: {
          select: { createdAt: true },
        },
      },
      orderBy: {
        interview: { createdAt: 'asc' },
      },
    }),
  ]);

  // Group scores by date for scoreOverTime
  const scoresByDate = new Map<string, number[]>();
  for (const q of scoredQuestions) {
    const date = q.interview.createdAt.toISOString().split('T')[0];
    const scores = scoresByDate.get(date) ?? [];
    scores.push(q.score!);
    scoresByDate.set(date, scores);
  }

  const scoreOverTime = Array.from(scoresByDate.entries()).map(([date, scores]) => ({
    date,
    averageScore: scores.reduce((a, b) => a + b, 0) / scores.length,
  }));

  return {
    totalSessions,
    averageScore: scoreAgg._avg.score ?? 0,
    recentSessions,
    scoreOverTime,
  };
}


export async function getUsageData(userId: string) {
  const user = await prisma.user.findUnique({ where: { id: userId }, select: { plan: true } });
  const plan = user?.plan ?? 'free';

  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);

  const interviewsToday = await prisma.interview.count({
    where: { userId, createdAt: { gte: startOfDay } },
  });

  return {
    plan,
    interviewsToday,
    interviewLimit: plan === 'free' ? 50 : null,
    chatLimit: plan === 'free' ? 100 : null,
  };
}
