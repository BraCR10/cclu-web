'use client';

import { useState, type FormEvent } from 'react';
import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Button } from '@/shared/components/Button';
import { Card } from '@/shared/components/Card';
import { Input } from '@/shared/components/Input';
import { StickyActionBar } from '@/shared/components/StickyActionBar';
import { useToast } from '@/shared/components/useToast';
import { useErrorFeedback } from '@/shared/errors/useErrorFeedback';
import { requestPasswordLink } from '../api/auth';

type FieldError = { field: string; message: string } | null;

export function ForgotPasswordForm() {
  const translate = useTranslations('auth');
  const { showToast } = useToast();
  const showError = useErrorFeedback();

  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [fieldError, setFieldError] = useState<FieldError>(null);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setFieldError(null);

    try {
      await requestPasswordLink(email);

      // The same answer whether or not the address is an account, so the toast
      // says what happens next rather than what was found.
      showToast({
        tone: 'success',
        title: translate('forgot.sentTitle'),
        message: translate('forgot.sentMessage'),
      });
    } catch (error) {
      setFieldError(showError(error));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto grid w-full max-w-4xl gap-8 py-8 lg:grid-cols-[minmax(0,1fr)_24rem] lg:items-start lg:py-12">
      <Card className="p-6 lg:max-w-xl">
        <Link
          href="/login"
          className="inline-flex min-h-11 items-center gap-1 text-label-m text-fg-secondary"
        >
          <ChevronLeft aria-hidden="true" className="h-4 w-4" />
          {translate('forgot.back')}
        </Link>

        <h1 className="mt-2 text-heading-xl text-fg">{translate('forgot.title')}</h1>
        <p className="mt-2 text-body-l text-fg-secondary">{translate('forgot.legend')}</p>

        <form onSubmit={submit} noValidate className="mt-6 flex flex-col gap-4">
          <Input
            label={translate('forgot.email')}
            name="email"
            type="email"
            autoComplete="email"
            required
            value={email}
            error={fieldError?.field === 'email' ? fieldError.message : undefined}
            onChange={(event) => setEmail(event.target.value)}
          />

          <StickyActionBar>
            <Button type="submit" loading={submitting} className="w-full">
              {translate('forgot.submit')}
            </Button>
          </StickyActionBar>
        </form>
      </Card>

      <Card as="aside" className="hidden p-6 lg:block">
        <h2 className="text-heading-s text-fg">{translate('reset.securityTitle')}</h2>
        <ul className="mt-4 flex flex-col gap-3">
          {(['expiry', 'ignore', 'never'] as const).map((item) => (
            <li key={item} className="flex gap-2 text-body-m text-fg-secondary">
              <span
                aria-hidden="true"
                className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary"
              />
              <span>{translate(`reset.security.${item}`)}</span>
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
}
