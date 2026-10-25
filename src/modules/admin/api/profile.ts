import { requestApi } from '@/shared/api/apiClient';

export type AdminAccountStatus =
  'active' | 'inactive' | 'invitation_pending' | 'invitation_expired';

// What an administrator may be told about their own account. The password hash
// has no field here because the API never builds one: the answer is put together
// field by field.
export type AdminProfile = {
  id: string;
  name: string | null;
  email: string;
  accountStatus: AdminAccountStatus;
};

export function readAdminProfile() {
  return requestApi<AdminProfile>('/api/admin/me');
}

export function updateAdminProfile(body: { name: string }) {
  return requestApi<AdminProfile>('/api/admin/me', { method: 'PATCH', body });
}

// The current password is asked for on purpose: a session left open on a shared
// machine must not be able to take the account.
export function changeOwnPassword(body: { currentPassword: string; newPassword: string }) {
  return requestApi<AdminProfile>('/api/admin/me/password', { method: 'POST', body });
}
