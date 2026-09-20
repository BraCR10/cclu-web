import { requestApi } from '@/shared/api/request';
import type { Account } from './roles';

// Two doors, because the API answers each differently: a member is told their
// application is still pending, an administrator is told nothing either way.
export const SIGN_IN_PATH = '/login';
export const ADMIN_SIGN_IN_PATH = '/admin/login';

export function fetchIdentity(): Promise<Account> {
  return requestApi<Account>('/api/auth/me');
}

// Signing out is a request rather than a local delete, because the cookie is
// the server's to clear and nothing here can reach it.
export function endSession(): Promise<void> {
  return requestApi<void>('/api/auth/logout', { method: 'POST' });
}
