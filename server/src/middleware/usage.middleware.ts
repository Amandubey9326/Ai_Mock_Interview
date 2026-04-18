import type { Request, Response, NextFunction } from 'express';
import prisma from '../lib/prisma';

const FREE_INTERVIEW_LIMIT = 50;
const FREE_CHAT_LIMIT = 100;

export function interviewUsageLimit() {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user?.id;
      if (!userId) { next(); return; }

      const user = await prisma.user.findUnique({ where: { id: userId }, select: { plan: true } });
      if (!user || user.plan !== 'free') { next(); return; }

      const startOfDay = new Date();
      startOfDay.setHours(0, 0, 0, 0);

      const todayCount = await prisma.interview.count({
        where: { userId, createdAt: { gte: startOfDay } },
      });

      if (todayCount >= FREE_INTERVIEW_LIMIT) {
        res.status(429).json({
          status: 429,
          message: 'Daily limit reached. Upgrade to premium for unlimited access.',
          limit: FREE_INTERVIEW_LIMIT,
          used: todayCount,
        });
        return;
      }

      next();
    } catch (err) {
      next(err);
    }
  };
}

export function chatUsageLimit() {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.user?.id;
      if (!userId) { next(); return; }

      const user = await prisma.user.findUnique({ where: { id: userId }, select: { plan: true } });
      if (!user || user.plan !== 'free') { next(); return; }

      // Chat messages are tracked in localStorage on client, but we count interviews as proxy
      // For a proper implementation we'd need a ChatMessage model. For now, use a simple in-memory counter.
      // We'll use a lightweight approach: count from a simple store
      const key = `chat:${userId}:${new Date().toISOString().split('T')[0]}`;
      const count = chatCountStore.get(key) ?? 0;

      if (count >= FREE_CHAT_LIMIT) {
        res.status(429).json({
          status: 429,
          message: 'Daily chat limit reached. Upgrade to premium for unlimited access.',
          limit: FREE_CHAT_LIMIT,
          used: count,
        });
        return;
      }

      chatCountStore.set(key, count + 1);
      next();
    } catch (err) {
      next(err);
    }
  };
}

// Simple in-memory store for chat counts (resets on server restart)
const chatCountStore = new Map<string, number>();
