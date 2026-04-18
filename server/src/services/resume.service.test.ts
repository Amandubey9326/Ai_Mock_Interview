import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('pdf-parse', () => ({
  default: vi.fn(),
}));

vi.mock('./ai.service', () => ({
  analyzeResume: vi.fn(),
}));

import pdfParse from 'pdf-parse';
import * as aiService from './ai.service';
import { analyzeResume } from './resume.service';

describe('resume.service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('extracts text from PDF and returns AI analysis', async () => {
    vi.mocked(pdfParse).mockResolvedValue({ text: 'John Doe - Software Engineer' } as any);
    vi.mocked(aiService.analyzeResume).mockResolvedValue({
      strengths: ['Strong experience'],
      weaknesses: ['No leadership'],
      missing_skills: ['Kubernetes'],
      suggestions: ['Add certifications'],
    });

    const buffer = Buffer.from('fake-pdf');
    const result = await analyzeResume(buffer);

    expect(pdfParse).toHaveBeenCalledWith(buffer);
    expect(aiService.analyzeResume).toHaveBeenCalledWith('John Doe - Software Engineer');
    expect(result.strengths).toEqual(['Strong experience']);
    expect(result.missing_skills).toEqual(['Kubernetes']);
  });

  it('throws 400 when PDF has no extractable text', async () => {
    vi.mocked(pdfParse).mockResolvedValue({ text: '' } as any);

    const buffer = Buffer.from('fake-pdf');
    await expect(analyzeResume(buffer)).rejects.toMatchObject({
      message: 'Could not extract text from PDF',
      status: 400,
    });
  });

  it('throws 400 when PDF text is only whitespace', async () => {
    vi.mocked(pdfParse).mockResolvedValue({ text: '   \n  ' } as any);

    const buffer = Buffer.from('fake-pdf');
    await expect(analyzeResume(buffer)).rejects.toMatchObject({
      status: 400,
    });
  });
});
