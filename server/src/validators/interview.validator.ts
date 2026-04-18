import { z } from 'zod';

const roles = ['Frontend', 'Backend', 'DSA', 'HR', 'DevOps', 'SystemDesign', 'DataScience', 'QAManual', 'QAAutomation'] as const;
const difficulties = ['Easy', 'Medium', 'Hard'] as const;

export const createInterviewInputSchema = z.object({
  role: z.enum(roles, { message: 'Invalid role' }),
  difficulty: z.enum(difficulties, { message: 'Invalid difficulty' }),
});

export type CreateInterviewInput = z.infer<typeof createInterviewInputSchema>;

export const submitAnswerInputSchema = z.object({
  answer: z.string().min(1, 'Answer is required'),
});

export type SubmitAnswerInput = z.infer<typeof submitAnswerInputSchema>;
