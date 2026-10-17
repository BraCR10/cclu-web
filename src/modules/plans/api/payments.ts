import { requestApi } from '@/shared/api/apiClient';
import { buildApiUrl } from '@/shared/api/apiUrl';
import { pageQuery, type Paginated } from '@/shared/api/pagination';
import type { PaidPlanKey } from './adminMemberships';
import type { PlanKey } from './plans';

export type PaymentStatus = 'pending_review' | 'approved' | 'rejected';

export type PaymentTerm = { startsAt: string; expiresAt: string; validUntil: string };

export type Payment = {
  id: string;
  plan: { key: PlanKey; name: string };
  monthlyFee: number;
  months: number;
  frequency: 'monthly' | 'quarterly' | 'semiannual' | 'annual';
  amount: number;
  reference: string;
  receipt: { contentType: string; size: number };
  comment: string | null;
  resubmissionOf: string | null;
  status: PaymentStatus;
  submittedAt: string;
  decidedAt: string | null;
  decidedBy: string | null;
  rejectionReason: string | null;
  term: PaymentTerm | null;
};

export type PaymentMember = { id: string; businessName: string; memberCode: string };

export type AdminPayment = Payment & { member: PaymentMember };

export type PaymentReview = AdminPayment & {
  sameReceipt: { id: string; status: PaymentStatus; submittedAt: string }[];
  earlierAttempts: Payment[];
};

export type PaymentEligibility = {
  canSubmit: boolean;
  reason: 'payment_pending' | 'renewal_not_open' | null;
  opensOn: string | null;
  pendingPaymentId: string | null;
  reference: string;
};

export const PAYMENT_PAGE_SIZE = 10;

export function readPaymentEligibility() {
  return requestApi<PaymentEligibility>('/api/members/me/payments/eligibility');
}

export type PaymentSubmission = {
  plan: PaidPlanKey;
  receipt: File;
  comment: string;
  resubmissionOf: string | null;
};

export function submitPayment({ plan, receipt, comment, resubmissionOf }: PaymentSubmission) {
  const body = new FormData();

  body.append('plan', plan);
  body.append('file', receipt);

  if (comment.trim() !== '') {
    body.append('comment', comment.trim());
  }

  if (resubmissionOf !== null) {
    body.append('resubmissionOf', resubmissionOf);
  }

  return requestApi<Payment>('/api/members/me/payments', { method: 'POST', body });
}

export function readOwnPayments(status: PaymentStatus | null, page: number) {
  const query = new URLSearchParams(pageQuery(page, PAYMENT_PAGE_SIZE));

  if (status !== null) {
    query.set('status', status);
  }

  return requestApi<Paginated<Payment>>(`/api/members/me/payments?${query.toString()}`);
}

export function readOwnPayment(paymentId: string) {
  return requestApi<Payment>(`/api/members/me/payments/${encodeURIComponent(paymentId)}`);
}

// The receipt is opened through the API, which checks who is asking. The
// session cookie travels with the image or frame request on its own.
export function ownReceiptUrl(paymentId: string) {
  return buildApiUrl(`/api/members/me/payments/${encodeURIComponent(paymentId)}/receipt`);
}

export type AdminPaymentList = Paginated<AdminPayment> & {
  counts: Record<PaymentStatus, number>;
};

export function readAdminPayments(status: PaymentStatus, search: string, page: number) {
  const query = new URLSearchParams(pageQuery(page, PAYMENT_PAGE_SIZE));

  query.set('status', status);

  if (search.trim() !== '') {
    query.set('search', search.trim());
  }

  return requestApi<AdminPaymentList>(`/api/admin/payments?${query.toString()}`);
}

export function readPaymentReview(paymentId: string) {
  return requestApi<PaymentReview>(`/api/admin/payments/${encodeURIComponent(paymentId)}`);
}

export function adminReceiptUrl(paymentId: string) {
  return buildApiUrl(`/api/admin/payments/${encodeURIComponent(paymentId)}/receipt`);
}

export function approvePayment(paymentId: string) {
  return requestApi<PaymentReview>(`/api/admin/payments/${encodeURIComponent(paymentId)}/approve`, {
    method: 'POST',
  });
}

export function rejectPayment(paymentId: string, reason: string) {
  return requestApi<PaymentReview>(`/api/admin/payments/${encodeURIComponent(paymentId)}/reject`, {
    method: 'POST',
    body: { reason },
  });
}
