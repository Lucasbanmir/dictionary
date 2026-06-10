import { apiRequest } from '@/lib/api';
import { AuthResponse } from '../types/auth';
import { SignInPayload } from '../types/singIn';

export function signIn(payload: SignInPayload) {
  return apiRequest<AuthResponse>('/auth/signin', {
    method: 'POST',
    auth: false,
    body: JSON.stringify(payload),
  });
}
