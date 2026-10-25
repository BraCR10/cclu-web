import { requestApi } from '@/shared/api/apiClient';

export type AdministratorStatus =
  'active' | 'invitation_pending' | 'invitation_expired' | 'inactive';

export type Administrator = {
  id: string;
  name: string | null;
  email: string;
  status: AdministratorStatus;
  invitationExpiresAt: string | null;
  createdAt: string | null;
};

export function readAdministrators() {
  return requestApi<{ items: Administrator[] }>('/api/admin/administrators');
}

export function inviteAdministrator(body: { name: string; email: string }) {
  return requestApi<Administrator>('/api/admin/administrators', { method: 'POST', body });
}

export function resendInvitation(adminId: string) {
  return requestApi<Administrator>(
    `/api/admin/administrators/${encodeURIComponent(adminId)}/invitation`,
    { method: 'POST' },
  );
}

export function setAdministratorStatus(adminId: string, status: 'active' | 'inactive') {
  return requestApi<Administrator>(
    `/api/admin/administrators/${encodeURIComponent(adminId)}/status`,
    { method: 'PATCH', body: { status } },
  );
}
