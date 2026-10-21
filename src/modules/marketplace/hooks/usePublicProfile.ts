'use client';

import { useEffect, useState } from 'react';
import { ApiError } from '@/shared/api/apiError';
import { readPublicProfile, type PublicProfile } from '../api/directory';

export type PublicProfileState =
  | { status: 'loading' }
  | { status: 'loaded'; profile: PublicProfile }
  | { status: 'missing' }
  | { status: 'failed' };

const NOT_FOUND = 404;

type Answer = { memberCode: string; state: PublicProfileState };

// A code that was never issued, or belongs to a suspended member, answers 404.
// Both read as "not listed", the same way the API means them.
export function usePublicProfile(memberCode: string): PublicProfileState {
  const [answer, setAnswer] = useState<Answer | null>(null);

  useEffect(() => {
    let cancelled = false;

    readPublicProfile(memberCode)
      .then((profile) => {
        if (!cancelled) {
          setAnswer({ memberCode, state: { status: 'loaded', profile } });
        }
      })
      .catch((error: unknown) => {
        if (!cancelled) {
          const missing = error instanceof ApiError && error.status === NOT_FOUND;
          setAnswer({ memberCode, state: { status: missing ? 'missing' : 'failed' } });
        }
      });

    return () => {
      cancelled = true;
    };
  }, [memberCode]);

  return answer !== null && answer.memberCode === memberCode ? answer.state : { status: 'loading' };
}
