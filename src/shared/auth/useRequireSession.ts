'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import type { Session } from './useSession';
import { SIGN_IN_PATH } from './sessionApi';

type RequireSessionOptions = {
  signInPath?: string;
  redirect?: (path: string) => void;
};

// Without this, an expired session leaves every request failing behind a screen
// that still looks usable. Sending the person to sign in is the only thing that
// answers the question they are about to ask.
export function useRequireSession(session: Session, options: RequireSessionOptions = {}): void {
  const router = useRouter();
  const signInPath = options.signInPath ?? SIGN_IN_PATH;
  const goTo = options.redirect ?? ((path: string) => router.replace(path));

  useEffect(() => {
    if (session.status === 'anonymous') {
      goTo(signInPath);
    }
    // The redirect depends on the status and the destination alone; rebuilding
    // goTo on every render must not send the person to sign in twice.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session.status, signInPath]);
}
