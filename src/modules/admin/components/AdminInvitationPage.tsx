'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { KeyRound } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Alert } from '@/shared/components/Alert';
import { Button } from '@/shared/components/Button';
import { Card } from '@/shared/components/Card';
import { Input } from '@/shared/components/Input';
import { PasswordRules } from '@/shared/components/PasswordRules';
import { useErrorPresenter } from '@/shared/errors/useErrorPresenter';
import { acceptInvitation, readInvitation, type Invitation } from '../api/administrators';

type Phase = 'loading' | 'invalid' | 'ready' | 'done';

// The link in the mail: it names the address the invitation went to, because
// that account is the one being opened and there is nothing to type.
export function AdminInvitationPage({ token }: { token: string }) {
  const translate = useTranslations('admin.invitation');
  const present = useErrorPresenter();
  // The presenter is rebuilt on every render, so the read keeps the one from its
  // first turn rather than running again each time the screen changes.
  const presenter = useRef(present);

  useEffect(() => {
    presenter.current = present;
  });

  const [phase, setPhase] = useState<Phase>('loading');
  const [invitation, setInvitation] = useState<Invitation | null>(null);
  const [problem, setProblem] = useState<string | null>(null);
  const [password, setPassword] = useState('');
  const [sending, setSending] = useState(false);

  useEffect(() => {
    let cancelled = false;

    readInvitation(token)
      .then((answer) => {
        if (!cancelled) {
          setInvitation(answer);
          setPhase('ready');
        }
      })
      .catch((error: unknown) => {
        if (!cancelled) {
          setProblem(presenter.current(error).message);
          setPhase('invalid');
        }
      });

    return () => {
      cancelled = true;
    };
  }, [token]);

  const submit = async () => {
    setSending(true);

    try {
      await acceptInvitation(token, password);
      setPhase('done');
    } catch (error) {
      setProblem(present(error).message);
    } finally {
      setSending(false);
    }
  };

  return (
    <Card className="mx-auto mt-8 w-full max-w-md p-6">
      <h1 className="text-heading-m text-fg">{translate('title')}</h1>

      {phase === 'loading' ? (
        <p className="mt-3 text-body-m text-fg-muted">{translate('loading')}</p>
      ) : null}

      {phase === 'invalid' ? (
        <>
          <div className="mt-4">
            <Alert tone="danger" title={translate('invalid')} message={problem} />
          </div>
          <p className="mt-4 text-body-m text-fg-muted">{translate('invalidHelp')}</p>
          <Link className="mt-6 inline-block text-body-m text-link underline" href="/login">
            {translate('toLogin')}
          </Link>
        </>
      ) : null}

      {phase === 'done' ? (
        <>
          <div className="mt-4">
            <Alert tone="success" title={translate('done')} />
          </div>
          <Link href="/login">
            <Button className="mt-6 w-full">{translate('toLogin')}</Button>
          </Link>
        </>
      ) : null}

      {phase === 'ready' && invitation ? (
        <>
          <p className="mt-3 text-body-m text-fg-muted">{translate('subtitle')}</p>

          <div className="mt-6 flex flex-col gap-4">
            {invitation.name ? (
              <Input label={translate('name')} value={invitation.name} readOnly disabled />
            ) : null}
            <Input label={translate('email')} value={invitation.email} readOnly disabled />
            <div>
              <Input
                label={translate('password')}
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
              />
              <PasswordRules password={password} />
            </div>
          </div>

          {problem ? (
            <div className="mt-4">
              <Alert tone="danger" title={problem} />
            </div>
          ) : null}

          <Button className="mt-6 w-full" disabled={sending} onClick={() => void submit()}>
            <KeyRound aria-hidden="true" className="h-4 w-4" />
            {translate('submit')}
          </Button>
        </>
      ) : null}
    </Card>
  );
}
