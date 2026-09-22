import { requestApi } from '@/shared/api/request';

export const MEMBERSHIP_TYPES = {
  FREE: 'free',
  PAID: 'paid',
} as const;

export type MembershipType = (typeof MEMBERSHIP_TYPES)[keyof typeof MEMBERSHIP_TYPES];

export type Membership = {
  type: MembershipType;
  paidUntil: string | null;
  feeAmount: number | null;
  benefits: { free: string[]; paid: string[] };
};

export const PAYMENT_STATUSES = {
  PENDING_REVIEW: 'pending_review',
  APPROVED: 'approved',
  REJECTED: 'rejected',
} as const;

export type PaymentStatus = (typeof PAYMENT_STATUSES)[keyof typeof PAYMENT_STATUSES];

export type Payment = {
  id: string;
  paidAt: string;
  detail: string | null;
  amount: number;
  status: PaymentStatus;
  statusReason: string | null;
  reviewedAt: string | null;
  receiptUrl: string | null;
  createdAt: string;
};

export type PaymentRegistration = {
  contentType: string;
  content: string;
  paidAt: string;
  detail?: string;
};

export function fetchOwnMembership(): Promise<Membership> {
  return requestApi<Membership>('/api/members/me/membership');
}

export function fetchMembershipFee(): Promise<{ amount: number | null }> {
  return requestApi<{ amount: number | null }>('/api/membership/fee');
}

export function fetchOwnPayments(): Promise<Payment[]> {
  return requestApi<Payment[]>('/api/members/me/payments');
}

export function registerPayment(registration: PaymentRegistration): Promise<Payment> {
  return requestApi<Payment>('/api/members/me/payments', {
    method: 'POST',
    body: JSON.stringify(registration),
  });
}
