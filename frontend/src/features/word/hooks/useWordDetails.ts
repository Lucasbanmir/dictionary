import { queryKeys } from '@/lib/queryKeys';
import { useQuery } from '@tanstack/react-query';
import { getWordDetails } from '../services/wordService';

export function useWordDetails(word: string, enabled = true) {
  return useQuery({
    queryKey: queryKeys.details(word),
    queryFn: () => getWordDetails(word),
    enabled: enabled && Boolean(word),
  });
}
