import apiClient from './client';
import type {
  CreateInterviewInput,
  InterviewSession,
  QuestionResponse,
  SubmitAnswerInput,
  EvaluationResponse,
  PaginatedInterviews,
  InterviewDetail,
} from '../types';

export async function createInterview(input: CreateInterviewInput): Promise<InterviewSession> {
  const { data } = await apiClient.post<InterviewSession>('/interviews', input);
  return data;
}

export async function generateQuestion(interviewId: string, company?: string): Promise<QuestionResponse> {
  const { data } = await apiClient.post<QuestionResponse>(`/interviews/${interviewId}/questions`, { company });
  return data;
}

export async function submitAnswer(
  interviewId: string,
  questionId: string,
  input: SubmitAnswerInput
): Promise<EvaluationResponse> {
  const { data } = await apiClient.post<EvaluationResponse>(
    `/interviews/${interviewId}/questions/${questionId}/answer`,
    input
  );
  return data;
}

export async function listInterviews(page?: number, limit?: number): Promise<PaginatedInterviews> {
  const params: Record<string, number> = {};
  if (page !== undefined) params.page = page;
  if (limit !== undefined) params.limit = limit;
  const { data } = await apiClient.get<PaginatedInterviews>('/interviews', { params });
  return data;
}

export async function getInterviewDetail(interviewId: string): Promise<InterviewDetail> {
  const { data } = await apiClient.get<InterviewDetail>(`/interviews/${interviewId}`);
  return data;
}
