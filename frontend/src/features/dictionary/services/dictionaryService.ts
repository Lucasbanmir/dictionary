import { buildPageQuery } from '@/shared/utils/utils';
import { apiRequest } from '../../../lib/api';
import { PageParams } from '@/shared/types/types';
import { WordListResponse } from '@/features/word/types/word';

export function listWords(params: PageParams = {}) {
  const query = buildPageQuery(params);
  return apiRequest<WordListResponse>(`/entries/en${query ? `?${query}` : ''}`);
}
