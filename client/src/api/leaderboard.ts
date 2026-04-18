import apiClient from './client';

export interface LeaderboardEntry {
  rank: number;
  name: string;
  averageScore: number;
  totalInterviews: number;
}

export async function getLeaderboard(): Promise<LeaderboardEntry[]> {
  const { data } = await apiClient.get<LeaderboardEntry[]>('/leaderboard');
  return data;
}
