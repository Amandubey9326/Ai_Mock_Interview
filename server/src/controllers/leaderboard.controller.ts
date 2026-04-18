import type { Request, Response, NextFunction } from 'express';
import * as leaderboardService from '../services/leaderboard.service';

export async function getLeaderboard(req: Request, res: Response, next: NextFunction) {
  try {
    const entries = await leaderboardService.getLeaderboard();
    res.status(200).json(entries);
  } catch (err) {
    next(err);
  }
}
