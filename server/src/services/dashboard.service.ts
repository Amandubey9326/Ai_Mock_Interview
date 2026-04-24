import prisma from '../lib/prisma';
import { getStreak } from './streak.service';
import { getUserXP } from './xp.service';

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

  const streak = await getStreak(userId);
  const xpInfo = await getUserXP(userId);

  return {
    totalSessions,
    averageScore: scoreAgg._avg.score ?? 0,
    recentSessions,
    scoreOverTime,
    currentStreak: streak.currentStreak,
    longestStreak: streak.longestStreak,
    xp: xpInfo,
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


export async function getRoleAnalytics(userId: string) {
  const questions = await prisma.interviewQuestion.findMany({
    where: {
      interview: { userId },
      score: { not: null },
    },
    select: {
      score: true,
      interview: {
        select: { role: true },
      },
    },
  });

  const roleMap = new Map<string, number[]>();
  for (const q of questions) {
    const role = q.interview.role;
    const scores = roleMap.get(role) ?? [];
    scores.push(q.score!);
    roleMap.set(role, scores);
  }

  const allRoles = ['Frontend', 'Backend', 'DSA', 'HR', 'DevOps', 'SystemDesign', 'DataScience', 'QAManual', 'QAAutomation'];

  return allRoles.map((role) => {
    const scores = roleMap.get(role) ?? [];
    return {
      role,
      averageScore: scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : 0,
      totalSessions: scores.length,
    };
  });
}


export async function getPeerComparison(userId: string) {
  // Get current user's average score
  const userAvg = await prisma.interviewQuestion.aggregate({
    _avg: { score: true },
    where: {
      interview: { userId },
      score: { not: null },
    },
  });

  const myScore = userAvg._avg.score ?? 0;

  // Get all users' average scores
  const allUsers = await prisma.interview.findMany({
    select: {
      userId: true,
      questions: {
        where: { score: { not: null } },
        select: { score: true },
      },
    },
  });

  // Compute per-user averages
  const userScores = new Map<string, number[]>();
  for (const interview of allUsers) {
    const scores = userScores.get(interview.userId) ?? [];
    for (const q of interview.questions) {
      if (q.score !== null) scores.push(q.score);
    }
    userScores.set(interview.userId, scores);
  }

  const averages = Array.from(userScores.values())
    .filter((scores) => scores.length > 0)
    .map((scores) => scores.reduce((a, b) => a + b, 0) / scores.length);

  const totalUsers = averages.length;
  const betterThan = averages.filter((avg) => myScore > avg).length;
  const percentile = totalUsers > 0 ? Math.round((betterThan / totalUsers) * 100) : 0;

  return {
    myAverageScore: myScore,
    percentile,
    totalUsers,
  };
}


export async function getReadinessScore(userId: string) {
  const [totalSessions, scoreAgg, streak, xpInfo] = await Promise.all([
    prisma.interview.count({ where: { userId } }),
    prisma.interviewQuestion.aggregate({
      _avg: { score: true },
      where: { interview: { userId }, score: { not: null } },
    }),
    prisma.user.findUnique({
      where: { id: userId },
      select: { currentStreak: true },
    }),
    getUserXP(userId),
  ]);

  const avgScore = scoreAgg._avg.score ?? 0;
  const currentStreak = streak?.currentStreak ?? 0;

  // Calculate readiness from 0-100
  const practiceScore = Math.min(30, (totalSessions / 20) * 30); // max 30 pts for 20+ sessions
  const performanceScore = Math.min(30, (avgScore / 10) * 30); // max 30 pts for 10/10 avg
  const consistencyScore = Math.min(20, (currentStreak / 7) * 20); // max 20 pts for 7-day streak
  const levelScore = Math.min(20, ((xpInfo.level - 1) / 6) * 20); // max 20 pts for max level

  const total = Math.round(practiceScore + performanceScore + consistencyScore + levelScore);

  let status: string;
  if (total >= 80) status = 'Interview Ready';
  else if (total >= 60) status = 'Almost There';
  else if (total >= 40) status = 'Getting Better';
  else if (total >= 20) status = 'Keep Practicing';
  else status = 'Just Starting';

  return {
    score: total,
    status,
    breakdown: {
      practice: Math.round(practiceScore),
      performance: Math.round(performanceScore),
      consistency: Math.round(consistencyScore),
      level: Math.round(levelScore),
    },
  };
}
