import { useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { clearAuthSession } from '../utils/authStorage';

export function useLogout() {
  const router = useRouter();
  const queryClient = useQueryClient();

  return () => {
    clearAuthSession();
    queryClient.clear();
    router.push('/signin');
  };
}
