'use client';

import { useEffect, useState } from 'react';
import {
  readAdminMemberships,
  type AdminMembershipList,
  type MembershipListQuery,
  type MembershipListStatus,
  type PaidPlanKey,
} from '../api/adminMemberships';

// Long enough that typing a name does not send a request per letter.
const SEARCH_PAUSE_IN_MILLISECONDS = 300;
const FIRST_PAGE = 1;

type Answer = { query: MembershipListQuery; list: AdminMembershipList | null; failed: boolean };

export function useAdminMemberships() {
  const [query, setQuery] = useState<MembershipListQuery>({
    status: 'active',
    plan: null,
    search: '',
    page: FIRST_PAGE,
  });
  const [searchDraft, setSearchDraft] = useState('');
  const [answer, setAnswer] = useState<Answer | null>(null);

  useEffect(() => {
    let cancelled = false;

    readAdminMemberships(query)
      .then((list) => {
        if (!cancelled) {
          setAnswer({ query, list, failed: false });
        }
      })
      .catch(() => {
        if (!cancelled) {
          setAnswer({ query, list: null, failed: true });
        }
      });

    return () => {
      cancelled = true;
    };
  }, [query]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setQuery((current) =>
        current.search === searchDraft
          ? current
          : { ...current, search: searchDraft, page: FIRST_PAGE },
      );
    }, SEARCH_PAUSE_IN_MILLISECONDS);

    return () => clearTimeout(timer);
  }, [searchDraft]);

  // The last answer stays on screen while the next one loads, so the page does
  // not empty and refill on every keystroke or page change.
  const list = answer?.list ?? null;

  return {
    query,
    list,
    loading: answer === null || answer.query !== query,
    failed: answer?.failed === true && answer.query === query,
    searchDraft,
    search: setSearchDraft,
    showStatus: (status: MembershipListStatus) =>
      setQuery((current) => ({ ...current, status, page: FIRST_PAGE })),
    filterPlan: (plan: PaidPlanKey | null) =>
      setQuery((current) => ({ ...current, plan, page: FIRST_PAGE })),
    showPage: (page: number) => setQuery((current) => ({ ...current, page })),
  };
}
