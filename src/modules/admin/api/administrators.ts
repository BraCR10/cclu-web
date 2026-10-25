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

// What the link shows before there is a password: the address it was sent to,
// fixed, so the person knows which account they are opening.
export type Invitation = { name: string | null; email: string };

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

export function readInvitation(token: string) {
  return requestApi<Invitation>(`/api/admin-invitations/${encodeURIComponent(token)}`);
}

export function acceptInvitation(token: string, password: string) {
  return requestApi<{ email: string }>(`/api/admin-invitations/${encodeURIComponent(token)}`, {
    method: 'POST',
    body: { password },
  });
}
