import { requestApi } from '@/shared/api/request';

export type CodeRequested = { minutesValid: number };

// The current password gates the whole flow, so holding an open session is not
// enough to take an account.
export function requestPasswordCode(currentPassword: string): Promise<CodeRequested> {
  return requestApi<CodeRequested>('/api/auth/password/request', {
    method: 'POST',
    body: JSON.stringify({ currentPassword }),
  });
}

export function confirmPasswordChange(
  code: string,
  newPassword: string,
): Promise<{ changed: true }> {
  return requestApi<{ changed: true }>('/api/auth/password/confirm', {
    method: 'POST',
    body: JSON.stringify({ code, newPassword }),
  });
}
