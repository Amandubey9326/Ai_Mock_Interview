import prisma from '../lib/prisma';

function getTodayStr(): string {
  return new Date().toISOString().split('T')[0];
}

function getYesterdayStr(): string {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return d.toISOString().split('T')[0];
}

export async function updateStreak(userId: string): Promise<{ currentStreak: number; longestStreak: number }> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { currentStreak: true, longestStreak: true, lastActiveDate: true },
  });

  if (!user) throw new Error('User not found');

  const today = getTodayStr();
  const yesterday = getYesterdayStr();

  // Already recorded today — no change
  if (user.lastActiveDate === today) {
    return { currentStreak: user.currentStreak, longestStreak: user.longestStreak };
  }

  let newStreak: number;

  if (user.lastActiveDate === yesterday) {
    // Consecutive day — extend streak
    newStreak = user.currentStreak + 1;
  } else {
    // Streak broken — start fresh
    newStreak = 1;
  }

  const newLongest = Math.max(user.longestStreak, newStreak);

  await prisma.user.update({
    where: { id: userId },
    data: {
      currentStreak: newStreak,
      longestStreak: newLongest,
      lastActiveDate: today,
    },
  });

  return { currentStreak: newStreak, longestStreak: newLongest };
}

export async function getStreak(userId: string): Promise<{ currentStreak: number; longestStreak: number }> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { currentStreak: true, longestStreak: true, lastActiveDate: true },
  });

  if (!user) throw new Error('User not found');

  const today = getTodayStr();
  const yesterday = getYesterdayStr();

  // If last active was before yesterday, streak is broken
  if (user.lastActiveDate && user.lastActiveDate !== today && user.lastActiveDate !== yesterday) {
    return { currentStreak: 0, longestStreak: user.longestStreak };
  }

  return { currentStreak: user.currentStreak, longestStreak: user.longestStreak };
}
