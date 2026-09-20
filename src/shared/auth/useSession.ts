'use client';

import { useCallback, useEffect, useState } from 'react';
import type { Account } from './roles';
import { endSession, fetchIdentity } from './sessionApi';

export type Session =
  | { status: 'loading'; identity: null }
  | { status: 'authenticated'; identity: Account }
  | { status: 'anonymous'; identity: null };

const LOADING: Session = { status: 'loading', identity: null };
const ANONYMOUS: Session = { status: 'anonymous', identity: null };

export type SessionHandle = Session & { signOut: () => Promise<void> };

// The client cannot read the session cookie, so it cannot tell who it is on its
// own. It asks, and the answer comes from a token the API verified.
export function useSession(
  readIdentity: () => Promise<Account> = fetchIdentity,
  closeSession: () => Promise<void> = endSession,
): SessionHandle {
  const [session, setSession] = useState<Session>(LOADING);

  useEffect(() => {
    let stillMounted = true;

    readIdentity()
      .then((identity) => {
        if (stillMounted) {
          setSession({ status: 'authenticated', identity });
        }
      })
      .catch(() => {
        if (stillMounted) {
          setSession(ANONYMOUS);
        }
      });

    return () => {
      stillMounted = false;
    };
    // Who we are is read once, when the application loads. Depending on the
    // function itself would re-read on every render that passes a new one, and
    // each answer would overwrite a sign out that had just happened.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const signOut = useCallback(async () => {
    // The session is dropped here even when the request fails, so nobody is
    // left looking at a screen that behaves as though they were still signed in.
    try {
      await closeSession();
    } finally {
      setSession(ANONYMOUS);
    }
  }, [closeSession]);

  return { ...session, signOut };
}
