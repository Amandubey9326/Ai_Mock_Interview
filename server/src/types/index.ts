export interface AIQuestionResult {
  question: string;
  type?: 'mcq' | 'descriptive';
  options?: string[];
  correctAnswer?: string;
}

export interface AIEvaluationResult {
  score: number;
  strengths: string[];
  weaknesses: string[];
  improvements: string[];
}

export interface AIResumeResult {
  overall_score: number;
  strengths: string[];
  weaknesses: string[];
  missing_skills: string[];
  suggestions: string[];
  ats_tips: string[];
  recommended_roles: string[];
}

export interface AuthResponse {
  token: string;
  user: {
    id: string;
    name: string;
    email: string;
    createdAt: Date;
  };
}

export interface JwtUserPayload {
  id: string;
  email: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: JwtUserPayload;
    }
  }
}
