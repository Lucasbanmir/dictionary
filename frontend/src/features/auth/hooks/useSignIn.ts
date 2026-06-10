import { signIn } from '@/features/auth/services/signInService';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { persistSession } from '../utils/authStorage';
import { SignInPayload } from '../types/singIn';

export function useSignIn() {
  const router = useRouter();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: SignInPayload) => signIn(payload),
    onSuccess: response => {
      persistSession(response);
      queryClient.clear();
      router.push('/');
    },
  });
}
