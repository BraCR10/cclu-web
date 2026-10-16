import { requestApi } from '@/shared/api/apiClient';
import type { AccountRole } from '@/shared/api/currentAccount';

// Which panel somebody is signing into is this module's business, so the two
// values travel with it rather than every caller reaching for them elsewhere.
export type { AccountRole };

export type SignInRequest = {
  role: AccountRole;
  email: string;
  password: string;
  rememberSession: boolean;
};

// One route per audience because what the answer may reveal differs: the member
// one explains the state of an application once the password is right, the
// administrator one says the same about a panel account.
export function signIn({ role, email, password, rememberSession }: SignInRequest) {
  return requestApi<void>(`/api/auth/${role}/login`, {
    method: 'POST',
    body: { email, password, rememberSession },
  });
}

// No session is needed to ask for this, and the cookie is cleared whatever the
// API makes of the request, which is exactly when clearing it matters.
export function signOut() {
  return requestApi<void>('/api/auth/logout', { method: 'POST' });
}

export function requestPasswordLink(email: string) {
  return requestApi<{ minutesValid: number }>('/api/auth/password/forgot', {
    method: 'POST',
    body: { email },
  });
}

export function checkResetLink(token: string) {
  return requestApi<{ valid: true; minutesValid: number }>(
    `/api/auth/password/reset/${encodeURIComponent(token)}`,
  );
}

export function resetPassword(token: string, newPassword: string) {
  return requestApi<{ changed: true }>('/api/auth/password/reset', {
    method: 'POST',
    body: { token, newPassword },
  });
}
