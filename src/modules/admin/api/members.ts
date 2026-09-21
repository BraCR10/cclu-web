import { requestApi } from '@/shared/api/request';

export type MembershipType = 'free' | 'paid';
export type MembershipStatus = 'active' | 'inactive' | 'terminated';

export type ManagedMembership = {
  type: MembershipType;
  status: MembershipStatus;
  expiresAt: string | null;
};

export type ManagedMember = {
  id: string;
  email: string;
  businessName: string;
  memberCode: string | null;
  accountStatus: 'active' | 'suspended' | 'terminated';
  state: 'active' | 'suspended' | 'terminated';
  membership: ManagedMembership | null;
};

export type MembershipChanges = Partial<{
  type: MembershipType;
  status: MembershipStatus;
  expiresAt: string | null;
}>;

export function fetchMembers(): Promise<ManagedMember[]> {
  return requestApi<ManagedMember[]>('/api/admin/members');
}

export function updateMemberStatus(
  memberId: string,
  accountStatus: ManagedMember['accountStatus'],
): Promise<{ id: string; accountStatus: string; state: string }> {
  return requestApi<{ id: string; accountStatus: string; state: string }>(
    `/api/admin/members/${memberId}/status`,
    {
      method: 'PATCH',
      body: JSON.stringify({ accountStatus }),
    },
  );
}

export function updateMemberMembership(
  memberId: string,
  changes: MembershipChanges,
): Promise<{
  id: string;
  memberId: string;
  type: string;
  status: string;
  expiresAt: string | null;
}> {
  return requestApi<{
    id: string;
    memberId: string;
    type: string;
    status: string;
    expiresAt: string | null;
  }>(`/api/admin/members/${memberId}/membership`, {
    method: 'PATCH',
    body: JSON.stringify(changes),
  });
}
