import { apiRequest } from '@/lib/api';
import { PageParams, PaginatedResponse, UserWord } from '@/shared/types/types';
import { buildPageQuery } from '@/shared/utils/utils';

export function addFavorite(word: string) {
  return apiRequest<void>(`/entries/en/${encodeURIComponent(word)}/favorite`, {
    method: 'POST',
  });
}

export function removeFavorite(word: string) {
  return apiRequest<void>(`/entries/en/${encodeURIComponent(word)}/unfavorite`, {
    method: 'DELETE',
  });
}

export function getFavorites(params: PageParams = {}) {
  const query = buildPageQuery(params);
  return apiRequest<PaginatedResponse<UserWord>>(`/user/me/favorites${query ? `?${query}` : ''}`);
}
