'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslations } from 'next-intl';
import type { Paginated } from '@/shared/api/pagination';
import { useToast } from '@/shared/components/useToast';
import { useErrorFeedback } from '@/shared/errors/useErrorFeedback';
import { readFeeChanges, updateFees, type FeeChange } from '../api/fees';
import { readPlans, type Plan, type PlanKey } from '../api/plans';
import { changedFees, draftsFrom, feeErrors, type FeeDrafts } from '../feeForm';

const FEE_FIELD = /^fees\.(lite|pro|premium)$/;
const FIRST_PAGE = 1;

export function useFeeEditor() {
  const translate = useTranslations('admin.plans');
  const translateErrors = useTranslations('errors');
  const { showToast } = useToast();
  const showError = useErrorFeedback();
  const [plans, setPlans] = useState<Plan[] | null>(null);
  const [history, setHistory] = useState<Paginated<FeeChange> | null>(null);
  const [failed, setFailed] = useState(false);
  const [drafts, setDrafts] = useState<FeeDrafts>({});
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  const showPlans = useCallback((loaded: Plan[]) => {
    setPlans(loaded);
    setDrafts(draftsFrom(loaded));
  }, []);

  useEffect(() => {
    let cancelled = false;

    Promise.all([readPlans(), readFeeChanges(FIRST_PAGE)])
      .then(([loadedPlans, firstPage]) => {
        if (!cancelled) {
          showPlans(loadedPlans);
          setHistory(firstPage);
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
  }, [showPlans]);

  const pending = useMemo(
    () => (plans === null ? {} : changedFees(plans, drafts)),
    [plans, drafts],
  );
  const hasChanges = Object.keys(pending).length > 0;

  function change(key: PlanKey, fee: number | null) {
    setDrafts((current) => ({ ...current, [key]: fee }));
    setFieldErrors((current) => ({ ...current, [`fees.${key}`]: '' }));
  }

  function discard() {
    if (plans !== null) {
      setDrafts(draftsFrom(plans));
      setFieldErrors({});
    }
  }

  async function showHistoryPage(page: number) {
    try {
      setHistory(await readFeeChanges(page));
    } catch (error) {
      showError(error);
    }
  }

  async function save() {
    const refused = Object.entries(feeErrors(pending));

    if (refused.length > 0) {
      setFieldErrors(
        Object.fromEntries(refused.map(([key, code]) => [`fees.${key}`, translateErrors(code)])),
      );
      return;
    }

    setSaving(true);

    try {
      showPlans(await updateFees(pending));
      setHistory(await readFeeChanges(FIRST_PAGE));
      setFieldErrors({});
      showToast({ tone: 'success', title: translate('saved') });
    } catch (error) {
      const fieldError = showError(error);

      // A refusal about the fees as a whole names no input, so it is said in a
      // toast rather than kept where nothing renders it.
      if (fieldError !== null && FEE_FIELD.test(fieldError.field)) {
        setFieldErrors((current) => ({ ...current, [fieldError.field]: fieldError.message }));
      } else if (fieldError !== null) {
        showToast({ tone: 'error', title: fieldError.message });
      }
    } finally {
      setSaving(false);
    }
  }

  return {
    plans,
    history,
    failed,
    drafts,
    errorFor: (key: PlanKey) => fieldErrors[`fees.${key}`] || undefined,
    hasChanges,
    saving,
    change,
    discard,
    save,
    showHistoryPage,
  };
}
