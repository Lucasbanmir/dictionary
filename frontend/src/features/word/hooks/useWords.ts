import { queryKeys } from '@/lib/queryKeys';
import { listWords } from '@/features/dictionary/services/dictionaryService';
import { useQuery } from '@tanstack/react-query';

export function useWords(search: string, page = 1, limit = 24) {
  return useQuery({
    queryKey: queryKeys.words(search, page),
    queryFn: () => listWords({ search, page, limit }),
  });
}
