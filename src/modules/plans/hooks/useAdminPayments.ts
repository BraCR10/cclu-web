'use client';

import { usePagedList, type PagedQuery } from '@/shared/hooks/usePagedList';
import { readAdminPayments, type AdminPaymentList, type PaymentStatus } from '../api/payments';

type PaymentFilters = { status: PaymentStatus };

function readPaymentPage({ status, search, page }: PagedQuery<PaymentFilters>) {
  return readAdminPayments(status, search, page);
}

export function useAdminPayments() {
  const payments = usePagedList<PaymentFilters, AdminPaymentList>(readPaymentPage, {
    status: 'pending_review',
  });

  return {
    ...payments,
    showStatus: (status: PaymentStatus) => payments.filter({ status }),
  };
}
