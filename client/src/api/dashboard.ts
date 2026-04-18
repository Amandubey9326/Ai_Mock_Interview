import apiClient from './client';
import type { DashboardData } from '../types';

export async function getDashboard(): Promise<DashboardData> {
  const { data } = await apiClient.get<DashboardData>('/dashboard');
  return data;
}


export interface UsageData {
  plan: string;
  interviewsToday: number;
  interviewLimit: number | null;
  chatLimit: number | null;
}

export async function getUsage(): Promise<UsageData> {
  const { data } = await apiClient.get<UsageData>('/dashboard/usage');
  return data;
}
