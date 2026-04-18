import prisma from '../lib/prisma';

export interface LeaderboardEntry {
  rank: number;
  name: string;
  averageScore: number;
  totalInterviews: number;
}

export async function getLeaderboard(): Promise<LeaderboardEntry[]> {
  const scoredQuestions = await prisma.interviewQuestion.findMany({
    where: { score: { not: null } },
    select: {
      score: true,
      interview: {
        select: {
          userId: true,
          id: true,
          user: { select: { name: true } },
        },
      },
    },
  });

  const userMap = new Map<string, { name: string; scores: number[]; interviewIds: Set<string> }>();

  for (const q of scoredQuestions) {
    const userId = q.interview.userId;
    if (!userMap.has(userId)) {
      userMap.set(userId, { name: q.interview.user.name, scores: [], interviewIds: new Set() });
    }
    const entry = userMap.get(userId)!;
    entry.scores.push(q.score!);
    entry.interviewIds.add(q.interview.id);
  }

  const entries: LeaderboardEntry[] = Array.from(userMap.entries())
    .map(([, data]) => ({
      rank: 0,
      name: data.name,
      averageScore: data.scores.reduce((a, b) => a + b, 0) / data.scores.length,
      totalInterviews: data.interviewIds.size,
    }))
    .sort((a, b) => b.averageScore - a.averageScore)
    .slice(0, 20)
    .map((entry, idx) => ({ ...entry, rank: idx + 1 }));

  return entries;
}
