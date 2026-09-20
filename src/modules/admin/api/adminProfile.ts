import { requestApi } from '@/shared/api/request';

export type AdminProfile = {
  id: string;
  name: string | null;
  email: string;
  accountStatus: string;
};

export function fetchOwnAdminProfile(): Promise<AdminProfile> {
  return requestApi<AdminProfile>('/api/admin/me');
}

// The name is the only thing an administrator decides about their own account.
// The rest is set by whoever created it.
export function updateOwnAdminName(name: string): Promise<AdminProfile> {
  return requestApi<AdminProfile>('/api/admin/me', {
    method: 'PATCH',
    body: JSON.stringify({ name }),
  });
}
