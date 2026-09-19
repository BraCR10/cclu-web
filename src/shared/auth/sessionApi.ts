import { requestApi } from '@/shared/api/request';
import type { Identity } from './roles';

export const SIGN_IN_PATH = '/login';

export function fetchIdentity(): Promise<Identity> {
  return requestApi<Identity>('/api/auth/me');
}

// Signing out is a request rather than a local delete, because the cookie is
// the server's to clear and nothing here can reach it.
export function endSession(): Promise<void> {
  return requestApi<void>('/api/auth/logout', { method: 'POST' });
}
