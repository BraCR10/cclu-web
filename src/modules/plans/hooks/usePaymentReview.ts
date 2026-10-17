'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { useToast } from '@/shared/components/useToast';
import { useErrorFeedback } from '@/shared/errors/useErrorFeedback';
import { useDates } from '@/shared/hooks/useDates';
import {
  approvePayment,
  readPaymentReview,
  rejectPayment,
  type PaymentReview,
} from '../api/payments';

const REASON_LENGTH = { minimum: 10, maximum: 300 };

// One payment under review: reading it, approving it, or rejecting it with a
// reason. A decision closes the review and tells the list to read again.
export function usePaymentReview(paymentId: string | null, onDecided: () => void) {
  const translate = useTranslations('admin.payments.review');
  const { showToast } = useToast();
  const showError = useErrorFeedback();
  const dates = useDates();
  const [loaded, setLoaded] = useState<{ id: string; review: PaymentReview } | null>(null);
  const [rejecting, setRejecting] = useState(false);
  const [reason, setReason] = useState('');
  const [reasonError, setReasonError] = useState<string | undefined>(undefined);
  const [deciding, setDeciding] = useState(false);

  useEffect(() => {
    if (paymentId === null) {
      return;
    }

    let cancelled = false;

    readPaymentReview(paymentId)
      .then((review) => {
        if (!cancelled) {
          setLoaded({ id: paymentId, review });
        }
      })
      .catch((error) => {
        if (!cancelled) {
          showError(error);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [paymentId, showError]);

  const review = loaded !== null && loaded.id === paymentId ? loaded.review : null;

  function finish() {
    setRejecting(false);
    setReason('');
    setReasonError(undefined);
    onDecided();
  }

  async function approve() {
    if (review === null) {
      return;
    }

    setDeciding(true);

    try {
      const decided = await approvePayment(review.id);
      showToast({
        tone: 'success',
        title: translate('approved'),
        message:
          decided.term === null
            ? undefined
            : translate('approvedMessage', {
                name: decided.member.businessName,
                date: dates.termEnd(decided.term.expiresAt),
              }),
      });
      finish();
    } catch (error) {
      showError(error);
    } finally {
      setDeciding(false);
    }
  }

  async function reject() {
    if (review === null) {
      return;
    }

    const text = reason.trim();

    if (text.length < REASON_LENGTH.minimum || text.length > REASON_LENGTH.maximum) {
      setReasonError(translate('reasonLength', REASON_LENGTH));
      return;
    }

    setDeciding(true);

    try {
      await rejectPayment(review.id, text);
      showToast({
        tone: 'success',
        title: translate('rejected'),
        message: translate('rejectedMessage'),
      });
      finish();
    } catch (error) {
      const fieldError = showError(error);

      if (fieldError !== null) {
        setReasonError(fieldError.message);
      }
    } finally {
      setDeciding(false);
    }
  }

  return {
    review,
    rejecting,
    startRejecting: () => setRejecting(true),
    stopRejecting: () => setRejecting(false),
    reason,
    changeReason: (value: string) => {
      setReason(value);
      setReasonError(undefined);
    },
    reasonError,
    reasonMaximum: REASON_LENGTH.maximum,
    deciding,
    approve,
    reject,
  };
}
