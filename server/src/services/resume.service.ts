import { PDFParse } from 'pdf-parse';
import * as aiService from './ai.service';
import type { AIResumeResult } from '../types';

export async function analyzeResume(fileBuffer: Buffer): Promise<AIResumeResult> {
  const parser = new PDFParse({ data: fileBuffer });
  const pdfData = await parser.getText();
  const text = pdfData.text;

  if (!text || text.trim().length === 0) {
    const error = new Error('Could not extract text from PDF');
    (error as any).status = 400;
    throw error;
  }

  const result = await aiService.analyzeResume(text);
  return result;
}
