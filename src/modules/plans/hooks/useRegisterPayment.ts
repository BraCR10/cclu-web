'use client';

import { useCallback, useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { useErrorFeedback } from '@/shared/errors/useErrorFeedback';
import type { PaidPlanKey } from '../api/adminMemberships';
import { readOwnMembership, type Membership } from '../api/membership';
import {
  readPaymentEligibility,
  submitPayment,
  type Payment,
  type PaymentEligibility,
} from '../api/payments';
import { readPlans, type Plan } from '../api/plans';
import { receiptProblem } from '../paymentStatus';

const PAID_PLANS: PaidPlanKey[] = ['lite', 'pro', 'premium'];

type Loaded = { eligibility: PaymentEligibility; membership: Membership; plans: Plan[] };

function isPaidPlan(value: string | undefined): value is PaidPlanKey {
  return PAID_PLANS.includes(value as PaidPlanKey);
}

export function useRegisterPayment(
  requestedPlan: string | undefined,
  resubmissionOf: string | null,
) {
  const translateErrors = useTranslations('errors');
  const showError = useErrorFeedback();
  const [loaded, setLoaded] = useState<Loaded | null>(null);
  const [failed, setFailed] = useState(false);
  const [plan, setPlan] = useState<PaidPlanKey | null>(
    isPaidPlan(requestedPlan) ? requestedPlan : null,
  );
  const [receipt, setReceipt] = useState<File | null>(null);
  const [comment, setComment] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState<Payment | null>(null);

  const load = useCallback(
    () => Promise.all([readPaymentEligibility(), readOwnMembership(), readPlans()]),
    [],
  );

  useEffect(() => {
    let cancelled = false;

    load()
      .then(([eligibility, membership, plans]) => {
        if (!cancelled) {
          setLoaded({ eligibility, membership, plans });
        }
      })
      .catch(() => {
        if (!cancelled) {
          setFailed(true);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [load]);

  // The plan a member holds is the one they most likely renew; Gratuita has
  // nothing to renew, so the first paid plan is offered.
  const chosenPlan =
    plan ??
    (loaded !== null && isPaidPlan(loaded.membership.plan.key)
      ? loaded.membership.plan.key
      : 'lite');

  function chooseReceipt(file: File) {
    const problem = receiptProblem(file);

    setErrors((current) => ({
      ...current,
      receipt: problem === null ? '' : translateErrors(problem),
    }));
    setReceipt(problem === null ? file : null);
  }

  async function submit() {
    if (receipt === null) {
      setErrors((current) => ({ ...current, receipt: translateErrors('required') }));
      return;
    }

    setSubmitting(true);

    try {
      setSent(await submitPayment({ plan: chosenPlan, receipt, comment, resubmissionOf }));
    } catch (error) {
      const fieldError = showError(error);

      if (fieldError !== null) {
        setErrors((current) => ({
          ...current,
          [fieldError.field === 'file' ? 'receipt' : fieldError.field]: fieldError.message,
        }));
      }

      // The window or a pending payment may have changed since the page
      // loaded; what the screen says is read again, if it can be.
      try {
        const [eligibility, membership, plans] = await load();
        setLoaded({ eligibility, membership, plans });
      } catch {
        setFailed(true);
      }
    } finally {
      setSubmitting(false);
    }
  }

  return {
    loaded,
    failed,
    plan: chosenPlan,
    choosePlan: setPlan,
    receipt,
    chooseReceipt,
    removeReceipt: () => setReceipt(null),
    comment,
    changeComment: setComment,
    errorFor: (field: string) => errors[field] || undefined,
    submitting,
    submit,
    sent,
  };
}
