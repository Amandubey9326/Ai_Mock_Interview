import prisma from '../lib/prisma';

export async function getPlatformStats() {
  const [totalUsers, totalInterviews, totalQuestions, avgScore] = await Promise.all([
    prisma.user.count(),
    prisma.interview.count(),
    prisma.interviewQuestion.count(),
    prisma.interviewQuestion.aggregate({
      _avg: { score: true },
      where: { score: { not: null } },
    }),
  ]);

  // Users created in last 7 days
  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 7);
  const newUsersThisWeek = await prisma.user.count({
    where: { createdAt: { gte: weekAgo } },
  });

  // Interviews today
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);
  const interviewsToday = await prisma.interview.count({
    where: { createdAt: { gte: startOfDay } },
  });

  // Role distribution
  const interviews = await prisma.interview.findMany({
    select: { role: true },
  });
  const roleCounts: Record<string, number> = {};
  for (const i of interviews) {
    roleCounts[i.role] = (roleCounts[i.role] || 0) + 1;
  }

  return {
    totalUsers,
    totalInterviews,
    totalQuestions,
    averageScore: avgScore._avg.score ?? 0,
    newUsersThisWeek,
    interviewsToday,
    roleDistribution: Object.entries(roleCounts).map(([role, count]) => ({ role, count })),
  };
}

export async function listUsers(page: number, limit: number) {
  const skip = (page - 1) * limit;
  const [users, total] = await Promise.all([
    prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
      select: {
        id: true,
        name: true,
        email: true,
        plan: true,
        isAdmin: true,
        createdAt: true,
        _count: { select: { interviews: true } },
      },
    }),
    prisma.user.count(),
  ]);

  return { users, total };
}
