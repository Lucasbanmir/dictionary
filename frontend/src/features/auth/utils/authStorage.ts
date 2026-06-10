import { AuthResponse } from '../types/auth';

const TOKEN_KEY = 'dictionary:auth-token';
const USER_KEY = 'dictionary:user';

export type StoredUser = {
  id: string;
  name: string;
};

export function persistSession(response: AuthResponse) {
  setAuthSession(response.token, {
    id: response.id,
    name: response.name,
  });
}

export function getAuthToken() {
  if (typeof window === 'undefined') {
    return null;
  }

  return window.localStorage.getItem(TOKEN_KEY);
}

export function setAuthSession(token: string, user: StoredUser) {
  window.localStorage.setItem(TOKEN_KEY, token);
  window.localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function clearAuthSession() {
  window.localStorage.removeItem(TOKEN_KEY);
  window.localStorage.removeItem(USER_KEY);
}

export function getStoredUser(): StoredUser | null {
  if (typeof window === 'undefined') {
    return null;
  }

  const value = window.localStorage.getItem(USER_KEY);
  if (!value) {
    return null;
  }

  try {
    return JSON.parse(value) as StoredUser;
  } catch {
    return null;
  }
}
