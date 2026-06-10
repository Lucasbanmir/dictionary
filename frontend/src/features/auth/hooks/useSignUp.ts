import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { persistSession } from '../utils/authStorage';
import { SignUpPayload } from '../types/signUp';
import { signUp } from '../services/signUpService';

export function useSignUp() {
  const router = useRouter();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: SignUpPayload) => signUp(payload),
    onSuccess: response => {
      persistSession(response);
      queryClient.clear();
      router.push('/');
    },
  });
}
