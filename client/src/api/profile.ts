import apiClient from './client';
import type { User } from '../types';

export async function updateProfile(name: string): Promise<User> {
  const { data } = await apiClient.patch<User>('/auth/profile', { name });
  return data;
}

export async function changePassword(oldPassword: string, newPassword: string): Promise<void> {
  await apiClient.patch('/auth/password', { oldPassword, newPassword });
}
