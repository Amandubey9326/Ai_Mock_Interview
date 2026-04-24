import prisma from '../lib/prisma';

const LEVELS = [
  { level: 1, name: 'Beginner', xpRequired: 0 },
  { level: 2, name: 'Novice', xpRequired: 100 },
  { level: 3, name: 'Intermediate', xpRequired: 300 },
  { level: 4, name: 'Advanced', xpRequired: 600 },
  { level: 5, name: 'Expert', xpRequired: 1000 },
  { level: 6, name: 'Master', xpRequired: 1500 },
  { level: 7, name: 'Grandmaster', xpRequired: 2500 },
];

export function getLevelInfo(xp: number) {
  let current = LEVELS[0];
  let next = LEVELS[1];

  for (let i = LEVELS.length - 1; i >= 0; i--) {
    if (xp >= LEVELS[i].xpRequired) {
      current = LEVELS[i];
      next = LEVELS[i + 1] || null;
      break;
    }
  }

  return {
    level: current.level,
    name: current.name,
    xp,
    xpForCurrentLevel: current.xpRequired,
    xpForNextLevel: next ? next.xpRequired : null,
    nextLevelName: next ? next.name : null,
    progress: next ? ((xp - current.xpRequired) / (next.xpRequired - current.xpRequired)) * 100 : 100,
  };
}

export function calculateXP(score: number, difficulty: string): number {
  const baseXP = score * 2;
  const difficultyMultiplier = difficulty === 'Hard' ? 3 : difficulty === 'Medium' ? 2 : 1;
  return Math.round(baseXP * difficultyMultiplier);
}

export async function awardXP(userId: string, xpAmount: number) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { xp: true, level: true },
  });

  if (!user) return;

  const newXP = user.xp + xpAmount;
  const levelInfo = getLevelInfo(newXP);

  await prisma.user.update({
    where: { id: userId },
    data: { xp: newXP, level: levelInfo.level },
  });

  return { xp: newXP, level: levelInfo.level, leveledUp: levelInfo.level > user.level };
}

export async function getUserXP(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { xp: true, level: true },
  });

  if (!user) return getLevelInfo(0);
  return getLevelInfo(user.xp);
}
