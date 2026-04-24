import type { Request, Response, NextFunction } from 'express';
import * as adminService from '../services/admin.service';

export async function getStats(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await adminService.getPlatformStats();
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
}

export async function getUsers(req: Request, res: Response, next: NextFunction) {
  try {
    const page = Math.max(1, parseInt(String(req.query.page ?? '1'), 10) || 1);
    const limit = Math.max(1, parseInt(String(req.query.limit ?? '20'), 10) || 20);
    const result = await adminService.listUsers(page, limit);
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
}
