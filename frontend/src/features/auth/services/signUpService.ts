import { apiRequest } from '@/lib/api';
import { SignUpPayload } from '../types/signUp';
import { AuthResponse } from '../types/auth';

export function signUp(payload: SignUpPayload) {
  return apiRequest<AuthResponse>('/auth/signup', {
    method: 'POST',
    auth: false,
    body: JSON.stringify(payload),
  });
}
