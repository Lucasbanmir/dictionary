import { apiRequest } from '@/lib/api';
import { WordDetails } from '../types/word';

export function getWordDetails(word: string) {
  return apiRequest<WordDetails[]>(`/entries/en/${encodeURIComponent(word)}`);
}
