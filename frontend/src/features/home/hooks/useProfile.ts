import { queryKeys } from '@/lib/queryKeys';
import { getProfile } from '@/features/home/services/homeService';
import { useQuery } from '@tanstack/react-query';

export function useProfile() {
  return useQuery({
    queryKey: queryKeys.profile,
    queryFn: getProfile,
  });
}
