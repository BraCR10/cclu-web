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
import { useDates } from '@/shared/hooks/useDates';
import { useErrorFeedback, type FieldError } from '@/shared/errors/useErrorFeedback';
import { isPasswordAcceptable } from '@/shared/validation/password';
import {
  acceptAdminInvitation,
  readAdminInvitation,
  signIn,
  type AdminInvitation,
} from '../api/auth';

const WHAT_THE_PANEL_IS_FOR = ['applications', 'payments', 'moderation', 'reports'] as const;

// P-20 / PM-20. The link is asked about before anything is drawn: a screen that
// offered the fields first would collect a password for a link already spent.
export function AdminInvitationForm({ token }: { token: string }) {
  const translate = useTranslations('auth.invitation');
  const translateCommon = useTranslations('common.actions');
  const router = useRouter();
  const dates = useDates();
  const showError = useErrorFeedback();

  const [link, setLink] = useState<'checking' | 'valid' | 'invalid'>('checking');
  const [invitation, setInvitation] = useState<AdminInvitation | null>(null);
  const [password, setPassword] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [fieldError, setFieldError] = useState<FieldError | null>(null);
  const [refused, setRefused] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    readAdminInvitation(token)
      .then((answer) => {
        if (!cancelled) {
          setInvitation(answer);
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

    if (mismatch || !isPasswordAcceptable(password) || invitation === null) {
      return;
    }

    setSubmitting(true);
    setFieldError(null);
    setRefused(null);

    try {
      await acceptAdminInvitation(token, password);
    } catch (error) {
      const presented = showError(error);

      // The link stopped being usable between opening the form and sending it,
      // which is what a link accepted in another tab looks like.
      if (presented !== null && presented.field === 'token') {
        setLink('invalid');
      } else if (presented !== null) {
        setFieldError(presented);
      } else {
        setRefused(translate('refused'));
      }

      setSubmitting(false);
      return;
    }

    // The password is set and the account is open. Signing in with it is the
    // login path's job, so it is asked for here rather than by minting a session
    // a second way; if it fails the person lands on the form that offers it.
    await signIn({
      role: 'admin',
      email: invitation.email,
      password,
      rememberSession: false,
    })
      .then(() => router.replace('/admin'))
      .catch(() => router.replace('/login'));
  }

  if (link === 'checking') {
    return (
      <Card className="mx-auto my-8 w-full max-w-xl p-6 lg:my-12">
        <p className="text-body-l text-fg-secondary">{translateCommon('loading')}</p>
      </Card>
    );
  }

  if (link === 'invalid' || invitation === null) {
    return (
      <Card className="mx-auto my-8 w-full max-w-xl p-6 lg:my-12">
        <h1 className="text-heading-xl text-fg">{translate('invalidTitle')}</h1>
        <div className="mt-4">
          <Alert
            tone="danger"
            title={translate('invalidTitle')}
            message={translate('invalidMessage')}
          />
        </div>
        <Link
          href="/login"
          className="mt-4 flex min-h-11 items-center justify-center rounded-sm border border-secondary-border px-4 text-label-m text-fg"
        >
          {translate('invalidAction')}
        </Link>
      </Card>
    );
  }

  const firstName = invitation.name === null ? null : invitation.name.split(' ')[0];

  return (
    <div className="mx-auto grid w-full max-w-4xl gap-8 py-8 lg:grid-cols-[minmax(0,1fr)_24rem] lg:items-start lg:py-12">
      <Card className="p-6 lg:max-w-xl">
        <h1 className="text-heading-xl text-fg">
          {firstName === null ? translate('title') : translate('titleNamed', { name: firstName })}
        </h1>
        <p className="mt-2 text-body-m text-fg-secondary">{translate('legend')}</p>

        {refused !== null && (
          <div className="mt-4">
            <Alert tone="danger" title={translate('refused')} message={refused} />
          </div>
        )}

        <form onSubmit={submit} noValidate className="mt-6 flex flex-col gap-4">
          <Input
            label={translate('email')}
            name="email"
            type="email"
            readOnly
            value={invitation.email}
            help={translate('emailHelp')}
          />

          <div>
            <Input
              label={translate('password')}
              name="password"
              type="password"
              autoComplete="new-password"
              required
              value={password}
              error={fieldError?.field === 'password' ? fieldError.message : undefined}
              onChange={(event) => setPassword(event.target.value)}
            />
            <PasswordRules password={password} />
          </div>

          <Input
            label={translate('confirmation')}
            name="passwordConfirmation"
            type="password"
            autoComplete="new-password"
            required
            value={confirmation}
            error={mismatch ? translate('mismatch') : undefined}
            onChange={(event) => setConfirmation(event.target.value)}
          />

          <StickyActionBar>
            <Button type="submit" loading={submitting} className="w-full">
              {translate('submit')}
            </Button>
          </StickyActionBar>

          {invitation.expiresAt !== null && (
            <p className="text-body-s text-fg-muted">
              {translate('expires', { date: dates.instant(invitation.expiresAt) })}
            </p>
          )}
        </form>
      </Card>

      <Card as="aside" className="hidden p-6 lg:block">
        <h2 className="text-heading-s text-fg">{translate('asideTitle')}</h2>
        <ul className="mt-4 flex flex-col gap-3">
          {WHAT_THE_PANEL_IS_FOR.map((item) => (
            <li key={item} className="flex gap-2 text-body-m text-fg-secondary">
              <span
                aria-hidden="true"
                className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary"
              />
              <span>{translate(`aside.${item}`)}</span>
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
}
