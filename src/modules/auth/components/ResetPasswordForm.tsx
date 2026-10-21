'use client';

import { useEffect, useState, type FormEvent } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Alert } from '@/shared/components/Alert';
import { Button } from '@/shared/components/Button';
import { Card } from '@/shared/components/Card';
import { Input } from '@/shared/components/Input';
import { PasswordRules } from '@/shared/components/PasswordRules';
import { StickyActionBar } from '@/shared/components/StickyActionBar';
import { useToast } from '@/shared/components/useToast';
import { useErrorFeedback } from '@/shared/errors/useErrorFeedback';
import { isPasswordAcceptable } from '@/shared/validation/password';
import { checkResetLink, resetPassword } from '../api/auth';

type FieldError = { field: string; message: string } | null;

export function ResetPasswordForm({ token }: { token: string }) {
  const translate = useTranslations('auth');
  const translateCommon = useTranslations('common.actions');
  const router = useRouter();
  const { showToast } = useToast();
  const showError = useErrorFeedback();

  // The link is asked about before anything is drawn: a screen that offered the
  // fields first would collect a new password for a link that is already spent.
  const [link, setLink] = useState<'checking' | 'valid' | 'invalid'>('checking');
  const [password, setPassword] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [fieldError, setFieldError] = useState<FieldError>(null);

  useEffect(() => {
    let cancelled = false;

    checkResetLink(token)
      .then(() => {
        if (!cancelled) {
          setLink('valid');
        }
      })
      .catch(() => {
        if (!cancelled) {
          setLink('invalid');
        }
      });

    return () => {
      cancelled = true;
    };
  }, [token]);

  const mismatch = confirmation !== '' && confirmation !== password;

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (mismatch || !isPasswordAcceptable(password)) {
      return;
    }

    setSubmitting(true);
    setFieldError(null);

    try {
      await resetPassword(token, password);

      showToast({
        tone: 'success',
        title: translate('reset.changedTitle'),
        message: translate('reset.changedMessage'),
      });
      router.replace('/login');
    } catch (error) {
      setFieldError(showError(error));
    } finally {
      setSubmitting(false);
    }
  }

  if (link === 'checking') {
    return (
      <Card className="mx-auto my-8 w-full max-w-xl p-6 lg:my-12">
        <p className="text-body-l text-fg-secondary">{translateCommon('loading')}</p>
      </Card>
    );
  }

  if (link === 'invalid') {
    return (
      <Card className="mx-auto my-8 w-full max-w-xl p-6 lg:my-12">
        <h1 className="text-heading-xl text-fg">{translate('reset.invalidTitle')}</h1>
        <div className="mt-4">
          <Alert
            tone="danger"
            title={translate('reset.invalidTitle')}
            message={translate('reset.invalidMessage')}
          />
        </div>
        <Link
          href="/password/forgot"
          className="mt-4 flex min-h-11 items-center justify-center rounded-sm border border-secondary-border px-4 text-label-m text-fg"
        >
          {translate('reset.invalidAction')}
        </Link>
      </Card>
    );
  }

  return (
    <div className="mx-auto grid w-full max-w-4xl gap-8 py-8 lg:grid-cols-[minmax(0,1fr)_24rem] lg:items-start lg:py-12">
      <Card className="p-6 lg:max-w-xl">
        <h1 className="text-heading-xl text-fg">{translate('reset.title')}</h1>

        <div className="mt-4">
          <Alert
            tone="info"
            title={translate('reset.expiresTitle')}
            message={translate('reset.expiresMessage')}
          />
        </div>

        <form onSubmit={submit} noValidate className="mt-6 flex flex-col gap-4">
          <div>
            <Input
              label={translate('reset.password')}
              name="newPassword"
              type="password"
              autoComplete="new-password"
              required
              value={password}
              error={fieldError?.field === 'newPassword' ? fieldError.message : undefined}
              onChange={(event) => setPassword(event.target.value)}
            />
            <PasswordRules password={password} />
          </div>

          <Input
            label={translate('reset.confirmation')}
            name="passwordConfirmation"
            type="password"
            autoComplete="new-password"
            required
            value={confirmation}
            error={mismatch ? translate('reset.mismatch') : undefined}
            onChange={(event) => setConfirmation(event.target.value)}
          />

          <StickyActionBar>
            <Button type="submit" loading={submitting} className="w-full">
              {translate('reset.submit')}
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
