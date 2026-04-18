import type { Request, Response, NextFunction } from 'express';
import * as resumeService from '../services/resume.service';

export async function analyzeResume(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.file) {
      res.status(400).json({ status: 400, message: 'No file uploaded' });
      return;
    }

    if (req.file.mimetype !== 'application/pdf') {
      res.status(400).json({ status: 400, message: 'Only PDF files are allowed' });
      return;
    }

    const result = await resumeService.analyzeResume(req.file.buffer);
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
}
