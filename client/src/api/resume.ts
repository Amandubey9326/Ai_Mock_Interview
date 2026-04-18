import apiClient from './client';
import type { ResumeAnalysis } from '../types';

export async function analyzeResume(file: File): Promise<ResumeAnalysis> {
  const formData = new FormData();
  formData.append('resume', file);
  const { data } = await apiClient.post<ResumeAnalysis>('/resume/analyze', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data;
}
