import { requestApi } from '@/shared/api/request';

export type LinkSent = { minutesValid: number };

// The current password gates this one, so holding an open session is not enough
// to make the chamber send anybody a link.
export function requestResetLink(currentPassword: string): Promise<LinkSent> {
  return requestApi<LinkSent>('/api/auth/password/request', {
    method: 'POST',
    body: JSON.stringify({ currentPassword }),
  });
}

// Somebody here has forgotten their password, so there is nothing to ask them
// for but the address. The API answers the same whether or not it is an account.
export function requestForgottenPassword(email: string): Promise<LinkSent> {
  return requestApi<LinkSent>('/api/auth/password/forgot', {
    method: 'POST',
    body: JSON.stringify({ email }),
  });
}

export function checkResetLink(token: string): Promise<{ valid: true; minutesValid: number }> {
  return requestApi<{ valid: true; minutesValid: number }>(
    `/api/auth/password/reset/${encodeURIComponent(token)}`,
  );
}

export function completePasswordReset(
  token: string,
  newPassword: string,
): Promise<{ changed: true }> {
  return requestApi<{ changed: true }>('/api/auth/password/reset', {
    method: 'POST',
    body: JSON.stringify({ token, newPassword }),
  });
}
