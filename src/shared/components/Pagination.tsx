'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { classNames } from '@/shared/utils/classNames';

export type PageSlot = number | 'gap';

const ALL_PAGES_LIMIT = 7;
const GAP_SYMBOL = '…';

function range(from: number, to: number): number[] {
  return Array.from({ length: to - from + 1 }, (_, index) => from + index);
}

// The first and last pages and the neighbours of the current one. A gap that
// would hide a single page shows that page instead, since the ellipsis takes
// the same room.
export function visiblePages(page: number, pageCount: number): PageSlot[] {
  if (pageCount <= ALL_PAGES_LIMIT) {
    return range(1, pageCount);
  }

  const start = Math.max(2, Math.min(page - 1, pageCount - 2));
  const end = Math.min(pageCount - 1, Math.max(page + 1, 3));
  const slots: PageSlot[] = [1];

  if (start === 3) slots.push(2);
  if (start > 3) slots.push('gap');
  slots.push(...range(start, end));
  if (end === pageCount - 2) slots.push(pageCount - 1);
  if (end < pageCount - 2) slots.push('gap');
  slots.push(pageCount);

  return slots;
}

type PaginationProps = {
  page: number;
  pageCount: number;
  onPageChange: (page: number) => void;
  summary?: string;
};

const CONTROL_CLASSES =
  'inline-flex size-11 items-center justify-center rounded-sm text-label-m focus-visible:shadow-focus focus-visible:outline-none lg:size-8';

export function Pagination({ page, pageCount, onPageChange, summary }: PaginationProps) {
  const translate = useTranslations('common.pagination');

  if (pageCount <= 1) {
    return null;
  }

  return (
    <nav
      aria-label={translate('label')}
      className="flex flex-col items-center gap-4 lg:flex-row lg:justify-between"
    >
      {summary && <p className="text-body-s text-fg-muted">{summary}</p>}
      <ul className="flex items-center gap-1">
        <li>
          <button
            type="button"
            aria-label={translate('previous')}
            disabled={page <= 1}
            onClick={() => onPageChange(page - 1)}
            className={`${CONTROL_CLASSES} border border-line text-fg-secondary disabled:opacity-40`}
          >
            <ChevronLeft aria-hidden className="size-4" />
          </button>
        </li>
        {visiblePages(page, pageCount).map((slot, index) =>
          slot === 'gap' ? (
            <li key={`gap-${index}`} aria-hidden className={`${CONTROL_CLASSES} text-fg-muted`}>
              {GAP_SYMBOL}
            </li>
          ) : (
            <li key={slot}>
              <button
                type="button"
                aria-label={translate('page', { page: slot })}
                aria-current={slot === page ? 'page' : undefined}
                onClick={() => onPageChange(slot)}
                className={classNames(
                  CONTROL_CLASSES,
                  slot === page
                    ? 'bg-primary text-on-primary'
                    : 'text-fg-secondary hover:bg-surface-hover',
                )}
              >
                {slot}
              </button>
            </li>
          ),
        )}
        <li>
          <button
            type="button"
            aria-label={translate('next')}
            disabled={page >= pageCount}
            onClick={() => onPageChange(page + 1)}
            className={`${CONTROL_CLASSES} border border-line text-fg-secondary disabled:opacity-40`}
          >
            <ChevronRight aria-hidden className="size-4" />
          </button>
        </li>
      </ul>
    </nav>
  );
}
