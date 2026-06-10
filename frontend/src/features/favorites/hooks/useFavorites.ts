import { queryKeys } from '@/lib/queryKeys';
import { useQuery } from '@tanstack/react-query';
import { getFavorites } from '../services/favoritesService';

export function useFavorites(page = 1, limit = 20) {
  return useQuery({
    queryKey: queryKeys.favorites(page),
    queryFn: () => getFavorites({ page, limit }),
  });
}
