import { describe, it, expect } from 'vitest';
import { createInterviewInputSchema, submitAnswerInputSchema } from './interview.validator';

describe('createInterviewInputSchema', () => {
  const validRoles = ['Frontend', 'Backend', 'DSA', 'HR', 'DevOps', 'SystemDesign', 'DataScience'];
  const validDifficulties = ['Easy', 'Medium', 'Hard'];

  it('accepts all valid role and difficulty combinations', () => {
    for (const role of validRoles) {
      for (const difficulty of validDifficulties) {
        const result = createInterviewInputSchema.safeParse({ role, difficulty });
        expect(result.success).toBe(true);
      }
    }
  });

  it('rejects invalid role', () => {
    const result = createInterviewInputSchema.safeParse({ role: 'InvalidRole', difficulty: 'Easy' });
    expect(result.success).toBe(false);
  });

  it('rejects invalid difficulty', () => {
    const result = createInterviewInputSchema.safeParse({ role: 'Frontend', difficulty: 'Expert' });
    expect(result.success).toBe(false);
  });

  it('rejects missing fields', () => {
    const result = createInterviewInputSchema.safeParse({});
    expect(result.success).toBe(false);
  });

  it('rejects empty role string', () => {
    const result = createInterviewInputSchema.safeParse({ role: '', difficulty: 'Easy' });
    expect(result.success).toBe(false);
  });

  it('rejects numeric values', () => {
    const result = createInterviewInputSchema.safeParse({ role: 123, difficulty: 456 });
    expect(result.success).toBe(false);
  });
});

describe('submitAnswerInputSchema', () => {
  it('accepts a non-empty answer', () => {
    const result = submitAnswerInputSchema.safeParse({ answer: 'My answer to the question.' });
    expect(result.success).toBe(true);
  });

  it('rejects empty answer', () => {
    const result = submitAnswerInputSchema.safeParse({ answer: '' });
    expect(result.success).toBe(false);
  });

  it('rejects missing answer field', () => {
    const result = submitAnswerInputSchema.safeParse({});
    expect(result.success).toBe(false);
  });

  it('rejects non-string answer', () => {
    const result = submitAnswerInputSchema.safeParse({ answer: 42 });
    expect(result.success).toBe(false);
  });
});
