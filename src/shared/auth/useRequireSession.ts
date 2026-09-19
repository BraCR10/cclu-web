'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import type { Session } from './useSession';
import { SIGN_IN_PATH } from './sessionApi';

type Redirect = (path: string) => void;

// Without this, an expired session leaves every request failing behind a screen
// that still looks usable. Sending the person to sign in is the only thing that
// answers the question they are about to ask.
export function useRequireSession(session: Session, redirect?: Redirect): void {
  const router = useRouter();
  const goTo = redirect ?? ((path: string) => router.replace(path));

  useEffect(() => {
    if (session.status === 'anonymous') {
      goTo(SIGN_IN_PATH);
    }
    // The redirect depends on the status alone; rebuilding goTo on every render
    // must not send the person to sign in twice.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session.status]);
}
