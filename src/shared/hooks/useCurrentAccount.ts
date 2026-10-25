'use client';

import { useEffect, useState } from 'react';
import { readCurrentAccount, type CurrentAccount } from '@/shared/api/currentAccount';

export type AccountState =
  { status: 'loading' } | { status: 'ready'; account: CurrentAccount } | { status: 'unknown' };

// Who is signed in, role included. The shells only need a name, which is why
// useCurrentViewer drops the rest; a screen that decides what to offer does need
// to know whether it is talking to an administrator, and reads it here.
export function useCurrentAccount(
  load: () => Promise<CurrentAccount> = readCurrentAccount,
): AccountState {
  const [state, setState] = useState<AccountState>({ status: 'loading' });

  useEffect(() => {
    let cancelled = false;

    load()
      .then((account) => {
        if (!cancelled) {
          setState({ status: 'ready', account });
        }
      })
      .catch(() => {
        if (!cancelled) {
          setState({ status: 'unknown' });
        }
      });

    return () => {
      cancelled = true;
    };
  }, [load]);

  return state;
}
