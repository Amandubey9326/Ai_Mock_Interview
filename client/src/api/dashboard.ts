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


export interface RoleAnalyticsItem {
  role: string;
  averageScore: number;
  totalSessions: number;
}

export async function getRoleAnalytics(): Promise<RoleAnalyticsItem[]> {
  const { data } = await apiClient.get<RoleAnalyticsItem[]>('/dashboard/role-analytics');
  return data;
}


export interface PeerComparisonData {
  myAverageScore: number;
  percentile: number;
  totalUsers: number;
}

export async function getPeerComparison(): Promise<PeerComparisonData> {
  const { data } = await apiClient.get<PeerComparisonData>('/dashboard/peer-comparison');
  return data;
}


export interface ReadinessData {
  score: number;
  status: string;
  breakdown: {
    practice: number;
    performance: number;
    consistency: number;
    level: number;
  };
}

export async function getReadiness(): Promise<ReadinessData> {
  const { data } = await apiClient.get<ReadinessData>('/dashboard/readiness');
  return data;
}
