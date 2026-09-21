import { requestApi } from '@/shared/api/request';
import type { Payment } from '@/modules/members/api/membership';

export type PendingPayment = Payment & {
  member: { id: string; businessName: string; memberCode: string | null; email: string };
};

export type MembershipRow = {
  member: {
    id: string;
    businessName: string;
    memberCode: string | null;
    email: string;
    canton: string | null;
    sector: string | null;
  };
  type: 'free' | 'paid';
  paidUntil: string | null;
};

export function fetchPendingPayments(): Promise<PendingPayment[]> {
  return requestApi<PendingPayment[]>('/api/admin/payments/pending');
}

export function approvePayment(
  id: string,
): Promise<{ id: string; status: string; paidUntil: string }> {
  return requestApi(`/api/admin/payments/${encodeURIComponent(id)}/approve`, { method: 'POST' });
}

export function rejectPayment(id: string, reason: string): Promise<{ id: string; status: string }> {
  return requestApi(`/api/admin/payments/${encodeURIComponent(id)}/reject`, {
    method: 'POST',
    body: JSON.stringify({ reason }),
  });
}

export function fetchMemberships(state?: 'active' | 'inactive'): Promise<MembershipRow[]> {
  const query = state === undefined ? '' : `?state=${state}`;

  return requestApi<MembershipRow[]>(`/api/admin/memberships${query}`);
}

export function fetchMemberPayments(memberId: string): Promise<Payment[]> {
  return requestApi<Payment[]>(`/api/admin/members/${encodeURIComponent(memberId)}/payments`);
}

export function fetchFee(): Promise<{ amount: number | null }> {
  return requestApi<{ amount: number | null }>('/api/membership/fee');
}

export function updateFee(amount: number): Promise<{ amount: number }> {
  return requestApi<{ amount: number }>('/api/admin/membership/fee', {
    method: 'PUT',
    body: JSON.stringify({ amount }),
  });
}
