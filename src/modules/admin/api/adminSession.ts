import { requestApi } from '@/shared/api/request';

export type AdminCredentials = {
  email: string;
  password: string;
};

// Answers 204 and nothing else. The session arrives as a cookie the browser
// stores by itself, so there is no token here to keep.
export function signInAdmin(credentials: AdminCredentials): Promise<void> {
  return requestApi<void>('/api/auth/admin/login', {
    method: 'POST',
    body: JSON.stringify(credentials),
  });
}
