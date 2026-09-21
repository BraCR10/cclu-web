import { requestApi } from '@/shared/api/request';

export type AdministratorRecord = {
  id: string;
  name: string | null;
  email: string;
  accountStatus: 'active' | 'suspended' | 'terminated';
  invitedByAdmin: string | null;
};

export type AdministratorInvitation = {
  sent: true;
  expires: boolean;
  daysValid?: number;
};

export type AdministratorChanges = Partial<Pick<AdministratorRecord, 'name' | 'email'>>;

export function fetchAdministrators(): Promise<AdministratorRecord[]> {
  return requestApi<AdministratorRecord[]>('/api/admin/administrators');
}

export function inviteAdministrator(
  email: string,
  options: { expires: boolean; expiresInDays?: number },
): Promise<AdministratorInvitation> {
  return requestApi<AdministratorInvitation>('/api/admin/administrators/invitations', {
    method: 'POST',
    body: JSON.stringify({
      email,
      expires: options.expires,
      ...(options.expires ? { expiresInDays: options.expiresInDays } : {}),
    }),
  });
}

export function updateAdministrator(
  administratorId: string,
  changes: AdministratorChanges,
): Promise<AdministratorRecord> {
  return requestApi<AdministratorRecord>(`/api/admin/administrators/${administratorId}`, {
    method: 'PATCH',
    body: JSON.stringify(changes),
  });
}

export function updateAdministratorStatus(
  administratorId: string,
  accountStatus: 'active' | 'suspended',
): Promise<AdministratorRecord> {
  return requestApi<AdministratorRecord>(`/api/admin/administrators/${administratorId}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ accountStatus }),
  });
}

// The invitation link is public: the person following it has no session yet and
// the token in the path is the proof the invitation is theirs.
export function acceptAdministratorInvitation(
  invitationId: string,
  password: string,
): Promise<{
  id: string;
  email: string;
  accountStatus: AdministratorRecord['accountStatus'];
}> {
  return requestApi<{
    id: string;
    email: string;
    accountStatus: AdministratorRecord['accountStatus'];
  }>(`/api/administrators/invitations/${invitationId}/accept`, {
    method: 'POST',
    body: JSON.stringify({ password }),
  });
}
