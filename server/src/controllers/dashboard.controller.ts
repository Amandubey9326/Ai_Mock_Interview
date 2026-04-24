import type { Request, Response, NextFunction } from 'express';
import * as dashboardService from '../services/dashboard.service';

export async function getDashboard(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.user!.id;
    const result = await dashboardService.getDashboardData(userId);
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
}


export async function getUsage(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.user!.id;
    const result = await dashboardService.getUsageData(userId);
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
}


export async function getRoleAnalytics(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.user!.id;
    const result = await dashboardService.getRoleAnalytics(userId);
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
}


export async function getPeerComparison(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.user!.id;
    const result = await dashboardService.getPeerComparison(userId);
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
}


export async function getReadiness(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.user!.id;
    const result = await dashboardService.getReadinessScore(userId);
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
}
