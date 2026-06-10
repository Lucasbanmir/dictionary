import { queryKeys } from '@/lib/queryKeys';
import { getHistory } from '@/features/home/services/homeService';
import { useQuery } from '@tanstack/react-query';

export function useHistory(page = 1, limit = 10) {
  return useQuery({
    queryKey: queryKeys.history(page),
    queryFn: () => getHistory({ page, limit }),
  });
}
