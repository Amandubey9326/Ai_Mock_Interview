export type Role = 'Frontend' | 'Backend' | 'DSA' | 'HR' | 'DevOps' | 'SystemDesign' | 'DataScience' | 'QAManual' | 'QAAutomation';
export type Difficulty = 'Easy' | 'Medium' | 'Hard';

export interface User {
  id: string;
  name: string;
  email: string;
  createdAt: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface CreateInterviewInput {
  role: Role;
  difficulty: Difficulty;
}

export interface SubmitAnswerInput {
  answer: string;
}

export interface InterviewSession {
  id: string;
  userId: string;
  role: Role;
  difficulty: Difficulty;
  createdAt: string;
}

export interface InterviewQuestion {
  id: string;
  interviewId: string;
  question: string;
  userAnswer: string | null;
  aiFeedback: AIFeedback | null;
  score: number | null;
}

export interface AIFeedback {
  strengths: string[];
  weaknesses: string[];
  improvements: string[];
}

export interface QuestionResponse {
  id: string;
  interviewId: string;
  question: string;
  type?: 'mcq' | 'descriptive';
  options?: string[];
  correctAnswer?: string;
}

export interface EvaluationResponse {
  id: string;
  question: string;
  userAnswer: string;
  score: number;
  aiFeedback: AIFeedback;
}

export interface InterviewDetail extends InterviewSession {
  questions: InterviewQuestion[];
}

export interface PaginatedInterviews {
  interviews: InterviewSession[];
  total: number;
}

export interface DashboardData {
  totalSessions: number;
  averageScore: number;
  recentSessions: {
    id: string;
    role: Role;
    difficulty: Difficulty;
    createdAt: string;
  }[];
  scoreOverTime: {
    date: string;
    averageScore: number;
  }[];
}

export interface ResumeAnalysis {
  overall_score: number;
  strengths: string[];
  weaknesses: string[];
  missing_skills: string[];
  suggestions: string[];
  ats_tips: string[];
  recommended_roles: string[];
}
