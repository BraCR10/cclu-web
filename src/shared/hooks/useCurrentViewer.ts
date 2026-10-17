'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { readCurrentAccount, type CurrentAccount } from '@/shared/api/currentAccount';
import type { Viewer } from '@/shared/layouts/ProfileMenu';

// Who the panel is greeting. Both panels ask the same question, and a session
// that turns out to be over answers with a refusal rather than a name, which is
// not an error to show: the menu simply has nothing to put above its items.
export function useCurrentViewer(
  load: () => Promise<CurrentAccount> = readCurrentAccount,
): Viewer | undefined {
  const translate = useTranslations('common.shell');
  const [viewer, setViewer] = useState<Viewer | undefined>(undefined);

  useEffect(() => {
    let cancelled = false;

    load()
      .then((account) => {
        if (cancelled) {
          return;
        }

        // A member is known by what the chamber calls them, and the code is the
        // one thing they are asked for by name at a counter. An administrator
        // has no code, so the address stands in.
        setViewer({
          name: account.displayName,
          detail:
            account.memberCode === null || account.memberCode === undefined
              ? account.email
              : translate('memberCode', { code: account.memberCode }),
        });
      })
      .catch(() => {
        if (!cancelled) {
          setViewer(undefined);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [load, translate]);

  return viewer;
}
