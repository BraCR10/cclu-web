'use client';

import { useEffect, useState } from 'react';

// Long enough that typing a name does not send a request per letter.
const SEARCH_PAUSE_IN_MILLISECONDS = 300;
const FIRST_PAGE = 1;

export type PagedQuery<Filters> = Filters & { search: string; page: number };

type Request<Filters> = { query: PagedQuery<Filters>; version: number };
type Answer<Filters, List> = { request: Request<Filters>; list: List | null; failed: boolean };

// A list the panel reads a page at a time. `read` must be defined outside the
// component, so it does not change between renders and refetch on each one.
export function usePagedList<Filters extends object, List>(
  read: (query: PagedQuery<Filters>) => Promise<List>,
  initialFilters: Filters,
  initialSearch = '',
) {
  const [request, setRequest] = useState<Request<Filters>>(() => ({
    query: { ...initialFilters, search: initialSearch, page: FIRST_PAGE },
    version: 0,
  }));
  const [searchDraft, setSearchDraft] = useState(initialSearch);
  const [answer, setAnswer] = useState<Answer<Filters, List> | null>(null);

  useEffect(() => {
    let cancelled = false;

    read(request.query)
      .then((list) => {
        if (!cancelled) {
          setAnswer({ request, list, failed: false });
        }
      })
      .catch(() => {
        if (!cancelled) {
          setAnswer({ request, list: null, failed: true });
        }
      });

    return () => {
      cancelled = true;
    };
  }, [read, request]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setRequest((current) =>
        current.query.search === searchDraft
          ? current
          : { ...current, query: { ...current.query, search: searchDraft, page: FIRST_PAGE } },
      );
    }, SEARCH_PAUSE_IN_MILLISECONDS);

    return () => clearTimeout(timer);
  }, [searchDraft]);

  const isCurrent = answer !== null && answer.request === request;

  return {
    query: request.query,
    // The last answer stays on screen while the next one loads, so the page
    // does not empty and refill on every keystroke or page change.
    list: answer?.list ?? null,
    loading: !isCurrent,
    failed: isCurrent && answer.failed,
    searchDraft,
    search: setSearchDraft,
    // Any filter change starts again from the first page, which always exists.
    filter: (changes: Partial<Filters>) =>
      setRequest((current) => ({
        ...current,
        query: { ...current.query, ...changes, page: FIRST_PAGE },
      })),
    showPage: (page: number) =>
      setRequest((current) => ({ ...current, query: { ...current.query, page } })),
    // After a decision the counts and the list both change.
    reload: () => setRequest((current) => ({ ...current, version: current.version + 1 })),
  };
}
