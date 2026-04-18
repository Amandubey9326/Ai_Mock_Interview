import type { Request, Response, NextFunction } from 'express';
import { createInterviewInputSchema, submitAnswerInputSchema } from '../validators/interview.validator';
import * as interviewService from '../services/interview.service';

function formatZodErrors(error: any) {
  return {
    status: 400,
    message: 'Validation failed',
    errors: error.issues.map((issue: any) => ({
      field: issue.path.join('.'),
      message: issue.message,
    })),
  };
}

export async function createInterview(req: Request, res: Response, next: NextFunction) {
  try {
    const parsed = createInterviewInputSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json(formatZodErrors(parsed.error));
      return;
    }

    const userId = req.user!.id;
    const result = await interviewService.createSession(userId, parsed.data.role, parsed.data.difficulty);
    res.status(201).json(result);
  } catch (err) {
    next(err);
  }
}

export async function listInterviews(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.user!.id;
    const page = Math.max(1, parseInt(String(req.query.page ?? '1'), 10) || 1);
    const limit = Math.max(1, parseInt(String(req.query.limit ?? '10'), 10) || 10);

    const result = await interviewService.listUserInterviews(userId, page, limit);
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
}

export async function getInterview(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await interviewService.getInterviewDetail(req.params.id as string);
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
}

export async function generateQuestion(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await interviewService.generateQuestion(req.params.id as string);
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
}

export async function submitAnswer(req: Request, res: Response, next: NextFunction) {
  try {
    const parsed = submitAnswerInputSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json(formatZodErrors(parsed.error));
      return;
    }

    const result = await interviewService.submitAnswer(req.params.qid as string, parsed.data.answer);
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
}
