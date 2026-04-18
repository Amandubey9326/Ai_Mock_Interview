import { describe, it, expect, vi, beforeEach } from 'vitest';

const { mockCreate } = vi.hoisted(() => ({
  mockCreate: vi.fn(),
}));

// Mock config
vi.mock('../config', () => ({
  config: {
    openaiApiKey: 'test-key',
  },
}));

// Mock OpenAI
vi.mock('openai', () => ({
  default: class {
    chat = { completions: { create: mockCreate } };
  },
}));

import { generateQuestion, evaluateAnswer, analyzeResume } from './ai.service';

function mockResponse(content: string) {
  return { choices: [{ message: { content } }] };
}

describe('ai.service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('generateQuestion', () => {
    it('sends correct prompt format and returns parsed question', async () => {
      mockCreate.mockResolvedValue(
        mockResponse(JSON.stringify({ question: 'What is React?' }))
      );

      const result = await generateQuestion('Frontend', 'Easy');

      expect(result).toEqual({ question: 'What is React?' });
      const call = mockCreate.mock.calls[0][0];
      expect(call.messages[0].content).toBe(
        'Generate a Easy level Frontend interview question.'
      );
      expect(call.response_format).toEqual({ type: 'json_object' });
    });

    it('throws 503 when OpenAI returns empty content', async () => {
      mockCreate.mockResolvedValue({ choices: [{ message: { content: null } }] });

      await expect(generateQuestion('Backend', 'Hard')).rejects.toMatchObject({
        message: 'AI service returned empty response',
        status: 503,
      });
    });

    it('throws 503 when OpenAI API fails', async () => {
      mockCreate.mockRejectedValue(new Error('Network error'));

      await expect(generateQuestion('DSA', 'Medium')).rejects.toMatchObject({
        message: 'AI service unavailable',
        status: 503,
      });
    });
  });

  describe('evaluateAnswer', () => {
    const validEval = {
      score: 8,
      strengths: ['Good structure'],
      weaknesses: ['Lacks depth'],
      improvements: ['Add examples'],
    };

    it('parses valid evaluation response', async () => {
      mockCreate.mockResolvedValue(mockResponse(JSON.stringify(validEval)));

      const result = await evaluateAnswer('What is REST?', 'REST is...');

      expect(result).toEqual(validEval);
    });

    it('throws 500 when score is below 1', async () => {
      mockCreate.mockResolvedValue(
        mockResponse(JSON.stringify({ ...validEval, score: 0 }))
      );

      await expect(
        evaluateAnswer('Q', 'A')
      ).rejects.toMatchObject({ status: 500, message: 'AI returned invalid score' });
    });

    it('throws 500 when score is above 10', async () => {
      mockCreate.mockResolvedValue(
        mockResponse(JSON.stringify({ ...validEval, score: 11 }))
      );

      await expect(
        evaluateAnswer('Q', 'A')
      ).rejects.toMatchObject({ status: 500, message: 'AI returned invalid score' });
    });

    it('throws 500 when score is not a number', async () => {
      mockCreate.mockResolvedValue(
        mockResponse(JSON.stringify({ ...validEval, score: 'high' }))
      );

      await expect(
        evaluateAnswer('Q', 'A')
      ).rejects.toMatchObject({ status: 500 });
    });

    it('throws 503 when OpenAI API fails', async () => {
      mockCreate.mockRejectedValue(new Error('timeout'));

      await expect(
        evaluateAnswer('Q', 'A')
      ).rejects.toMatchObject({ status: 503 });
    });
  });

  describe('analyzeResume', () => {
    const validResume = {
      strengths: ['Strong experience'],
      weaknesses: ['No certifications'],
      missing_skills: ['Docker'],
      suggestions: ['Add projects section'],
    };

    it('parses valid resume analysis response', async () => {
      mockCreate.mockResolvedValue(mockResponse(JSON.stringify(validResume)));

      const result = await analyzeResume('John Doe, Software Engineer...');

      expect(result).toEqual(validResume);
    });

    it('throws 503 when OpenAI returns empty content', async () => {
      mockCreate.mockResolvedValue({ choices: [{ message: { content: null } }] });

      await expect(
        analyzeResume('resume text')
      ).rejects.toMatchObject({ status: 503 });
    });

    it('throws 503 when OpenAI API fails', async () => {
      mockCreate.mockRejectedValue(new Error('API error'));

      await expect(
        analyzeResume('resume text')
      ).rejects.toMatchObject({ status: 503 });
    });
  });
});
