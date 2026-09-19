import { requestApi } from '@/shared/api/request';

export type MemberCredentials = {
  email: string;
  password: string;
};

// The reasons the API names once the password was right. Anything else means it
// never got that far.
export const REFUSAL_REASONS = {
  APPLICATION_PENDING: 'application_pending',
  APPLICATION_REJECTED: 'application_rejected',
  ACCOUNT_SUSPENDED: 'account_suspended',
} as const;

export function signInMember(credentials: MemberCredentials): Promise<void> {
  return requestApi<void>('/api/auth/member/login', {
    method: 'POST',
    body: JSON.stringify(credentials),
  });
}
