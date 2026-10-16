import { requestApi } from './apiClient';

export type AccountRole = 'member' | 'admin';

// What a signed in person may be told about themselves. The session carries an
// identifier and a role and nothing else, so the name and the member code have
// to be asked for separately.
export type CurrentAccount = {
  id: string;
  role: AccountRole;
  email: string;
  displayName: string;
  memberCode?: string | null;
  state?: string;
};

export function readCurrentAccount() {
  return requestApi<CurrentAccount>('/api/auth/me');
}
