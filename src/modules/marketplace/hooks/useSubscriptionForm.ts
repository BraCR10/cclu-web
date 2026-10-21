'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { readCantons, type CatalogCanton } from '@/shared/api/catalogs';
import { useToast } from '@/shared/components/useToast';
import { useErrorFeedback } from '@/shared/errors/useErrorFeedback';
import { subscribe, type SubscriptionDraft } from '../api/subscriptions';

const EMPTY_DRAFT: SubscriptionDraft = {
  name: '',
  email: '',
  whatsappNumber: '',
  canton: '',
  district: '',
  acceptsPromotions: false,
};

type DraftField = keyof SubscriptionDraft;

// What is missing before anything is sent. The API checks the same again.
export function missingSubscriptionFields(draft: SubscriptionDraft): DraftField[] {
  const missing: DraftField[] = (['name', 'canton', 'district', 'email'] as const).filter(
    (field) => draft[field].trim() === '',
  );

  return draft.acceptsPromotions ? missing : [...missing, 'acceptsPromotions'];
}

export function useSubscriptionForm(onSubscribed: () => void) {
  const translate = useTranslations('public.subscription');
  const { showToast } = useToast();
  const showError = useErrorFeedback();
  const [draft, setDraft] = useState<SubscriptionDraft>(EMPTY_DRAFT);
  const [cantons, setCantons] = useState<CatalogCanton[]>([]);
  const [errors, setErrors] = useState<Partial<Record<DraftField, string>>>({});
  const [sending, setSending] = useState(false);

  useEffect(() => {
    let cancelled = false;

    readCantons()
      .then((list) => !cancelled && setCantons(list))
      .catch(() => {});

    return () => {
      cancelled = true;
    };
  }, []);

  function change<Field extends DraftField>(field: Field, value: SubscriptionDraft[Field]) {
    setDraft((current) => ({ ...current, [field]: value }));
    setErrors((current) => ({ ...current, [field]: undefined }));
  }

  async function submit() {
    const missing = missingSubscriptionFields(draft);

    if (missing.length > 0) {
      setErrors(
        Object.fromEntries(
          missing.map((field) => [
            field,
            field === 'acceptsPromotions' ? translate('consentRequired') : translate('required'),
          ]),
        ),
      );
      return;
    }

    setSending(true);

    try {
      await subscribe(draft);
      showToast({ tone: 'success', title: translate('thanks') });
      setDraft(EMPTY_DRAFT);
      onSubscribed();
    } catch (error) {
      const fieldError = showError(error);

      if (fieldError !== null) {
        setErrors({ [fieldError.field]: fieldError.message });
      }
    } finally {
      setSending(false);
    }
  }

  return { draft, cantons, errors, sending, change, submit };
}
