'use client';

import { useState, type FormEvent } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Button } from '@/shared/components/Button';
import { Card } from '@/shared/components/Card';
import { Checkbox } from '@/shared/components/Checkbox';
import { Input } from '@/shared/components/Input';
import { SegmentedControl } from '@/shared/components/SegmentedControl';
import { StickyActionBar } from '@/shared/components/StickyActionBar';
import { useToast } from '@/shared/components/useToast';
import { useErrorFeedback } from '@/shared/errors/useErrorFeedback';
import { signIn, type AccountRole } from '../api/auth';
import { noticeForRefusal, toneForNotice, type SignInNotice } from '../noticeForRefusal';

type FieldError = { field: string; message: string } | null;

export function SignInForm({ initialRole = 'member' }: { initialRole?: AccountRole }) {
  const translate = useTranslations('auth');
  const router = useRouter();
  const { showToast } = useToast();
  const showError = useErrorFeedback();

  const [role, setRole] = useState<AccountRole>(initialRole);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [fieldError, setFieldError] = useState<FieldError>(null);

  // Written out rather than looked up by a built key, so a sentence that stops
  // existing stops compiling instead of rendering its own name.
  function noticeCopy(notice: SignInNotice): { title: string; message: string } {
    switch (notice) {
      case 'pending':
        return {
          title: translate('notices.applicationPending.title'),
          message: translate('notices.applicationPending.message'),
        };
      case 'rejected':
        return {
          title: translate('notices.applicationRejected.title'),
          message: translate('notices.applicationRejected.message'),
        };
      case 'suspended':
        return {
          title: translate('notices.accountSuspended.title'),
          message: translate('notices.accountSuspended.message'),
        };
      case 'invitationPending':
        return {
          title: translate('notices.invitationPending.title'),
          message: translate('notices.invitationPending.message'),
        };
      case 'invitationExpired':
        return {
          title: translate('notices.invitationExpired.title'),
          message: translate('notices.invitationExpired.message'),
        };
      default:
        return {
          title: translate('notices.accountInactive.title'),
          message: translate('notices.accountInactive.message'),
        };
    }
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setFieldError(null);

    try {
      await signIn({ role, email, password, rememberSession: remember });

      // Each panel lives behind its own shell, so which door to open is known
      // from the switch the person just used.
      router.replace(role === 'admin' ? '/admin' : '/member');
    } catch (error) {
      const notice = noticeForRefusal(error);

      if (notice === null) {
        setFieldError(showError(error));
      } else {
        const copy = noticeCopy(notice);

        showToast({ tone: toneForNotice(notice), title: copy.title, message: copy.message });
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_24rem] lg:items-start">
      <Card className="p-6 lg:max-w-xl">
        <h1 className="text-heading-xl text-fg">{translate('signIn.title')}</h1>
        <p className="mt-2 text-body-l text-fg-secondary">{translate('signIn.legend')}</p>

        <form onSubmit={submit} noValidate className="mt-6 flex flex-col gap-4">
          <SegmentedControl
            legend={translate('signIn.roleLegend')}
            name="role"
            value={role}
            onChange={(value) => setRole(value === 'admin' ? 'admin' : 'member')}
            options={[
              { value: 'member', label: translate('signIn.roles.member') },
              { value: 'admin', label: translate('signIn.roles.admin') },
            ]}
          />

          <Input
            label={translate('signIn.email')}
            name="email"
            type="email"
            autoComplete="email"
            required
            value={email}
            error={fieldError?.field === 'email' ? fieldError.message : undefined}
            onChange={(event) => setEmail(event.target.value)}
          />

          <Input
            label={translate('signIn.password')}
            name="password"
            type="password"
            autoComplete="current-password"
            required
            value={password}
            error={fieldError?.field === 'password' ? fieldError.message : undefined}
            onChange={(event) => setPassword(event.target.value)}
          />

          <div className="flex flex-col gap-2 lg:flex-row lg:items-center lg:justify-between">
            <Checkbox
              label={translate('signIn.remember')}
              name="rememberSession"
              checked={remember}
              onChange={(event) => setRemember(event.target.checked)}
            />
            <Link href="/password/forgot" className="text-label-m text-fg-link">
              {translate('signIn.forgot')}
            </Link>
          </div>

          <StickyActionBar>
            <Button type="submit" loading={submitting} className="w-full">
              {translate('signIn.submit')}
            </Button>
          </StickyActionBar>
        </form>

        {role === 'member' && (
          <div className="mt-6 border-t border-line-subtle pt-6">
            <p className="text-heading-s text-fg">{translate('signIn.joinTitle')}</p>
            <p className="mt-1 text-body-m text-fg-secondary">{translate('signIn.joinMessage')}</p>
            <Link
              href="/register"
              className="mt-3 flex min-h-11 items-center justify-center rounded-sm border border-secondary-border px-4 text-label-m text-fg"
            >
              {translate('signIn.joinAction')}
            </Link>
          </div>
        )}
      </Card>

      {role === 'member' && (
        <Card as="aside" className="hidden p-6 lg:block">
          <h2 className="text-heading-s text-fg">{translate('signIn.benefitsTitle')}</h2>
          <ul className="mt-4 flex flex-col gap-3">
            {(['card', 'payments', 'publications', 'profile'] as const).map((benefit) => (
              <li key={benefit} className="flex gap-2 text-body-m text-fg-secondary">
                <span
                  aria-hidden="true"
                  className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary"
                />
                <span>{translate(`signIn.benefits.${benefit}`)}</span>
              </li>
            ))}
          </ul>
        </Card>
      )}
    </div>
  );
}
