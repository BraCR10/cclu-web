'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Alert } from '@/shared/components/Alert';
import { Card } from '@/shared/components/Card';
import { signOut } from '../api/auth';

// Signing out is a step, not a screen somebody reads. It happens, and they land
// on the home page. Because it needs no session, it also works for the person
// whose session already expired, which is when clearing the cookie matters.
export function SignOutPanel() {
  const translate = useTranslations('auth');
  const translateErrors = useTranslations('errors');
  const router = useRouter();
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let cancelled = false;

    signOut()
      .then(() => {
        if (!cancelled) {
          router.replace('/');
        }
      })
      .catch(() => {
        // Left on the page rather than sent home: the cookie is still there, and
        // saying nothing would look as though it had been cleared.
        if (!cancelled) {
          setFailed(true);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [router]);

  return (
    <Card className="mx-auto my-8 w-full max-w-xl p-6 lg:my-12">
      <h1 className="text-heading-l text-fg">{translate('signOut.title')}</h1>

      {failed ? (
        <div className="mt-4">
          <Alert tone="danger" title={translateErrors('network_error')} />
        </div>
      ) : (
        <p className="mt-2 text-body-m text-fg-secondary">{translate('signOut.legend')}</p>
      )}
    </Card>
  );
}
