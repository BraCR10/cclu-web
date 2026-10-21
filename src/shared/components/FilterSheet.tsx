'use client';

import { useState, type ReactNode } from 'react';
import { SlidersHorizontal } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useIsDesktop } from '@/shared/hooks/useMediaQuery';
import { BottomSheet } from './BottomSheet';
import { Button } from './Button';

type ChangeFilters<Filters> = (changes: Partial<Filters>) => void;

type FilterSheetProps<Filters extends object> = {
  title: string;
  value: Filters;
  empty: Filters;
  onApply: (filters: Filters) => void;
  renderFields: (filters: Filters, change: ChangeFilters<Filters>) => ReactNode;
};

export function countActiveFilters<Filters extends object>(value: Filters, empty: Filters) {
  return (Object.keys(empty) as Array<keyof Filters>).filter((key) => value[key] !== empty[key])
    .length;
}

// The filters of a panel list. On a desktop they sit beside the search and
// apply as they change; on a telephone they wait in a sheet until applied, so
// the list does not reload under the person on every choice.
export function FilterSheet<Filters extends object>({
  title,
  value,
  empty,
  onApply,
  renderFields,
}: FilterSheetProps<Filters>) {
  const translate = useTranslations('common.filters');
  const isDesktop = useIsDesktop();
  const [draft, setDraft] = useState<Filters | null>(null);
  const activeCount = countActiveFilters(value, empty);

  if (isDesktop) {
    return (
      <div className="flex items-end gap-3">
        {renderFields(value, (changes) => onApply({ ...value, ...changes }))}
      </div>
    );
  }

  const apply = (filters: Filters) => {
    onApply(filters);
    setDraft(null);
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setDraft(value)}
        aria-label={
          activeCount === 0 ? translate('open') : translate('openWithCount', { count: activeCount })
        }
        className="relative inline-flex size-11 shrink-0 items-center justify-center rounded-sm border border-line bg-surface text-fg focus-visible:shadow-focus focus-visible:outline-none"
      >
        <SlidersHorizontal aria-hidden className="size-5" />
        {activeCount > 0 && (
          <span
            aria-hidden
            className="absolute -top-1.5 -right-1.5 inline-flex size-5 items-center justify-center rounded-full bg-primary text-label-s text-on-primary"
          >
            {activeCount}
          </span>
        )}
      </button>

      <BottomSheet
        open={draft !== null}
        title={title}
        onClose={() => setDraft(null)}
        footer={
          <div className="flex gap-3">
            <Button variant="ghost" onClick={() => apply(empty)}>
              {translate('clear')}
            </Button>
            <Button className="flex-1" onClick={() => draft !== null && apply(draft)}>
              {translate('apply')}
            </Button>
          </div>
        }
      >
        {draft !== null && (
          <div className="flex flex-col gap-4">
            {renderFields(draft, (changes) => setDraft({ ...draft, ...changes }))}
          </div>
        )}
      </BottomSheet>
    </>
  );
}
