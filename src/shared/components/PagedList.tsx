'use client';

import type { ReactNode } from 'react';
import { useTranslations } from 'next-intl';
import { Alert } from './Alert';
import { Pagination } from './Pagination';

type PageInfo = { total: number; page: number; pageCount: number };

type PagedListProps = {
  list: PageInfo | null;
  loading: boolean;
  failed: boolean;
  emptyMessage: string;
  summary?: string;
  onPageChange: (page: number) => void;
  children: ReactNode;
};

// Everything a panel list shows around its rows: the failure, the first load,
// the empty state, and the pages. The rows themselves are the caller's.
export function PagedList({
  list,
  loading,
  failed,
  emptyMessage,
  summary,
  onPageChange,
  children,
}: PagedListProps) {
  const translateErrors = useTranslations('errors');

  return (
    <>
      {failed && <Alert tone="danger" title={translateErrors('network_error')} />}

      {list === null && loading && (
        <div aria-hidden className="h-80 animate-pulse rounded-lg bg-surface-hover" />
      )}

      {list !== null && list.total === 0 && (
        <p className="rounded-lg border border-line-subtle bg-surface p-6 text-body-m text-fg-secondary">
          {emptyMessage}
        </p>
      )}

      {list !== null && list.total > 0 && (
        <div aria-busy={loading} className="flex flex-col gap-4">
          {children}
          {list.pageCount > 1 ? (
            <Pagination
              page={list.page}
              pageCount={list.pageCount}
              onPageChange={onPageChange}
              summary={summary}
            />
          ) : (
            summary && <p className="text-body-s text-fg-muted">{summary}</p>
          )}
        </div>
      )}
    </>
  );
}
