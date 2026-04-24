import apiClient from './client';

export interface PlatformStats {
  totalUsers: number;
  totalInterviews: number;
  totalQuestions: number;
  averageScore: number;
  newUsersThisWeek: number;
  interviewsToday: number;
  roleDistribution: { role: string; count: number }[];
}

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  plan: string;
  isAdmin: boolean;
  createdAt: string;
  _count: { interviews: number };
}

export async function getAdminStats(): Promise<PlatformStats> {
  const { data } = await apiClient.get<PlatformStats>('/admin/stats');
  return data;
}

export async function getAdminUsers(page = 1, limit = 20): Promise<{ users: AdminUser[]; total: number }> {
  const { data } = await apiClient.get('/admin/users', { params: { page, limit } });
  return data;
}
