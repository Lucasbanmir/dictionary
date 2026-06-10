import { buildPageQuery } from '@/shared/utils/utils';
import { apiRequest } from '../../../lib/api';
import { UserProfile } from '../types/home';
import type { PageParams, PaginatedResponse, UserWord } from '../../../shared/types/types';

export function getProfile() {
  return apiRequest<UserProfile>('/user/me');
}

export function getHistory(params: PageParams = {}) {
  const query = buildPageQuery(params);
  return apiRequest<PaginatedResponse<UserWord>>(`/user/me/history${query ? `?${query}` : ''}`);
}

export function clearHistory() {
  return apiRequest<void>('/user/me/history', {
    method: 'DELETE',
  });
}
