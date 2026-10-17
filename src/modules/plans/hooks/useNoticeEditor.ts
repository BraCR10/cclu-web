'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { useToast } from '@/shared/components/useToast';
import { useErrorFeedback } from '@/shared/errors/useErrorFeedback';
import {
  readMembershipPolicy,
  updateMembershipPolicy,
  type MembershipPolicy,
} from '../api/adminMemberships';

const WHOLE_NUMBER = /^\d{1,2}$/;

export function useNoticeEditor() {
  const translate = useTranslations('admin.plans.notice');
  const translateErrors = useTranslations('errors');
  const { showToast } = useToast();
  const showError = useErrorFeedback();
  const [policy, setPolicy] = useState<MembershipPolicy | null>(null);
  const [draft, setDraft] = useState('');
  const [error, setError] = useState<string | undefined>(undefined);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let cancelled = false;

    readMembershipPolicy()
      .then((loaded) => {
        if (!cancelled) {
          setPolicy(loaded);
          setDraft(String(loaded.expiryNoticeDays));
        }
      })
      .catch(() => {});

    return () => {
      cancelled = true;
    };
  }, []);

  const days = WHOLE_NUMBER.test(draft) ? Number(draft) : null;
  const hasChange = policy !== null && days !== policy.expiryNoticeDays;

  function change(value: string) {
    setDraft(value.replace(/\D/g, '').slice(0, 2));
    setError(undefined);
  }

  // Checked here with the bounds the API sent, so a value out of range is
  // explained before anything is sent. The API checks it again.
  async function save() {
    if (policy === null) {
      return;
    }

    if (days === null || days < policy.minimum || days > policy.maximum) {
      setError(translate('outOfRange', { minimum: policy.minimum, maximum: policy.maximum }));
      return;
    }

    setSaving(true);

    try {
      const saved = await updateMembershipPolicy(days);
      setPolicy(saved);
      setDraft(String(saved.expiryNoticeDays));
      showToast({ tone: 'success', title: translate('saved') });
    } catch (caught) {
      const fieldError = showError(caught);

      if (fieldError !== null) {
        setError(fieldError.message || translateErrors('generic'));
      }
    } finally {
      setSaving(false);
    }
  }

  return { policy, draft, error, hasChange, saving, change, save };
}
