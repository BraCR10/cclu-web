import { describe, expect, it } from 'vitest';
import { MAXIMUM_RECEIPT_BYTES, receiptProblem } from '@/modules/plans/paymentStatus';

function file(type: string, size: number) {
  return new File([new Uint8Array(size)], 'comprobante', { type });
}

describe('receiptProblem', () => {
  it('accepts a JPG, PNG or PDF receipt up to five megabytes', () => {
    for (const type of ['image/jpeg', 'image/png', 'application/pdf']) {
      expect(receiptProblem(file(type, MAXIMUM_RECEIPT_BYTES))).toBeNull();
    }
  });

  it('explains a type the chamber does not accept before anything is sent', () => {
    for (const type of ['image/webp', 'text/html', 'application/zip', '']) {
      expect(receiptProblem(file(type, 10))).toBe('file_type_not_allowed');
    }
  });

  it('explains a receipt larger than five megabytes before anything is sent', () => {
    expect(receiptProblem(file('image/png', MAXIMUM_RECEIPT_BYTES + 1))).toBe('file_too_large');
  });
});
