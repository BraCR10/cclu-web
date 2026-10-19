'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { CircleCheck, CircleX } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Card } from '@/shared/components/Card';
import { useErrorPresenter } from '@/shared/errors/useErrorPresenter';
import { confirmEmailChange, readEmailChange } from '../api/profile';

type ConfirmState = 'loading' | 'ready' | 'sent' | 'failed';

// The page the link in the message opens, on whatever device that is. Reading it
// says which address would be applied; confirming is a separate request, so a
// message that is merely previewed changes nothing.
export function EmailChangeConfirmation({ token }: { token: string }) {
  const translate = useTranslations('member.profile.email.confirm');
  const present = useErrorPresenter();

  const [state, setState] = useState<ConfirmState>('loading');
  const [email, setEmail] = useState<string | null>(null);
  const [failure, setFailure] = useState<unknown>(null);
  const [confirming, setConfirming] = useState(false);

  useEffect(() => {
    let cancelled = false;

    readEmailChange(token)
      .then((answer) => {
        if (!cancelled) {
          setEmail(answer.email);
          setState('ready');
        }
      })
      .catch((error: unknown) => {
        if (!cancelled) {
          setFailure(error);
          setState('failed');
        }
      });

    return () => {
      cancelled = true;
    };
  }, [token]);

  async function confirm() {
    setConfirming(true);

    try {
      await confirmEmailChange(token);
      setState('sent');
    } catch (error) {
      setFailure(error);
      setState('failed');
    } finally {
      setConfirming(false);
    }
  }

  if (state === 'failed') {
    return (
      <Card className="p-6 lg:p-8">
        <CircleX aria-hidden="true" className="h-10 w-10 text-danger" />
        <h1 className="mt-4 text-heading-l text-fg">{translate('invalidTitle')}</h1>
        <p className="mt-2 text-body-m text-fg-secondary">
          {failure === null ? translate('invalidMessage') : present(failure).message}
        </p>
        <Link
          href="/member/profile"
          className="mt-6 flex min-h-11 items-center justify-center rounded-sm bg-primary px-6 text-label-m text-on-primary md:inline-flex md:px-8"
        >
          {translate('toProfile')}
        </Link>
      </Card>
    );
  }

  if (state === 'sent') {
    return (
      <Card className="p-6 lg:p-8">
        <CircleCheck aria-hidden="true" className="h-10 w-10 text-success" />
        <h1 className="mt-4 text-heading-l text-fg">{translate('doneTitle')}</h1>
        <p className="mt-2 text-body-m text-fg-secondary">
          {translate('doneMessage', { email: email ?? '' })}
        </p>
        <Link
          href="/login"
          className="mt-6 flex min-h-11 items-center justify-center rounded-sm bg-primary px-6 text-label-m text-on-primary md:inline-flex md:px-8"
        >
          {translate('signIn')}
        </Link>
      </Card>
    );
  }

  return (
    <Card className="p-6 lg:p-8">
      <h1 className="text-heading-l text-fg">
        {state === 'loading' ? translate('loading') : translate('title')}
      </h1>
      {state === 'ready' && (
        <>
          <p className="mt-2 text-body-m text-fg-secondary">
            {translate('message', { email: email ?? '' })}
          </p>
          <button
            type="button"
            disabled={confirming}
            onClick={() => void confirm()}
            className="mt-6 flex min-h-11 items-center justify-center rounded-sm bg-primary px-6 text-label-m text-on-primary disabled:cursor-not-allowed disabled:bg-surface-hover disabled:text-fg-muted md:inline-flex md:px-8"
          >
            {translate('confirm')}
          </button>
        </>
      )}
    </Card>
  );
}
