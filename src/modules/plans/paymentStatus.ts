import type { StatusTone } from '@/shared/components/StatusBadge';
import type { PaymentStatus } from './api/payments';

export const PAYMENT_STATUS_TONES: Record<PaymentStatus, StatusTone> = {
  pending_review: 'info',
  approved: 'success',
  rejected: 'danger',
};

// What a person may hand in, checked here so a wrong file is explained before
// it is sent. The API checks the bytes again.
export const RECEIPT_TYPES = ['image/jpeg', 'image/png', 'application/pdf'];
export const RECEIPT_ACCEPT = '.jpg,.jpeg,.png,.pdf,image/jpeg,image/png,application/pdf';
export const MAXIMUM_RECEIPT_BYTES = 5 * 1024 * 1024;

export type ReceiptProblem = 'file_type_not_allowed' | 'file_too_large' | null;

export function receiptProblem(file: File): ReceiptProblem {
  if (!RECEIPT_TYPES.includes(file.type)) {
    return 'file_type_not_allowed';
  }

  return file.size > MAXIMUM_RECEIPT_BYTES ? 'file_too_large' : null;
}
