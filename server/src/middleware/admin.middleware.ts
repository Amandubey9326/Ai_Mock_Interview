import type { Request, Response, NextFunction } from 'express';
import prisma from '../lib/prisma';

export async function adminMiddleware(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.user) {
      res.status(401).json({ status: 401, message: 'Unauthorized' });
      return;
    }

    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: { isAdmin: true },
    });

    if (!user?.isAdmin) {
      res.status(403).json({ status: 403, message: 'Forbidden: Admin access required' });
      return;
    }

    next();
  } catch (err) {
    next(err);
  }
}
