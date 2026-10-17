'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslations } from 'next-intl';
import { useToast } from '@/shared/components/useToast';
import { useErrorFeedback } from '@/shared/errors/useErrorFeedback';
import { readFeeChanges, updateFees, type FeeChange } from '../api/fees';
import { readPlans, type Plan, type PlanKey } from '../api/plans';
import { changedFees, draftsFrom, type FeeDrafts } from '../feeForm';

type Loaded = { plans: Plan[]; history: FeeChange[] };

const FEE_FIELD = /^fees\.(lite|pro|premium)$/;

function readEditorData() {
  return Promise.all([readPlans(), readFeeChanges()]);
}

export function useFeeEditor() {
  const translate = useTranslations('admin.plans');
  const { showToast } = useToast();
  const showError = useErrorFeedback();
  const [loaded, setLoaded] = useState<Loaded | null>(null);
  const [failed, setFailed] = useState(false);
  const [drafts, setDrafts] = useState<FeeDrafts>({});
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  const show = useCallback((plans: Plan[], history: FeeChange[]) => {
    setLoaded({ plans, history });
    setDrafts(draftsFrom(plans));
  }, []);

  useEffect(() => {
    let cancelled = false;

    readEditorData()
      .then(([plans, history]) => {
        if (!cancelled) {
          show(plans, history);
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
  }, [show]);

  const pending = useMemo(
    () => (loaded === null ? {} : changedFees(loaded.plans, drafts)),
    [loaded, drafts],
  );
  const hasChanges = Object.keys(pending).length > 0;

  function change(key: PlanKey, fee: number | null) {
    setDrafts((current) => ({ ...current, [key]: fee }));
    setFieldErrors((current) => ({ ...current, [`fees.${key}`]: '' }));
  }

  function discard() {
    if (loaded !== null) {
      setDrafts(draftsFrom(loaded.plans));
      setFieldErrors({});
    }
  }

  async function save() {
    setSaving(true);

    try {
      await updateFees(pending);
      show(...(await readEditorData()));
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
    plans: loaded?.plans ?? null,
    history: loaded?.history ?? [],
    failed,
    drafts,
    errorFor: (key: PlanKey) => fieldErrors[`fees.${key}`] || undefined,
    hasChanges,
    saving,
    change,
    discard,
    save,
  };
}
