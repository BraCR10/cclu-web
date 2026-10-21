'use client';

import { Inbox } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Button } from '@/shared/components/Button';
import { FilterSheet } from '@/shared/components/FilterSheet';
import { PageHeader } from '@/shared/components/PageHeader';
import { PagedList } from '@/shared/components/PagedList';
import { SearchField } from '@/shared/components/SearchField';
import { NO_DIRECTORY_FILTERS, type DirectoryFilters } from '../api/directory';
import { useDirectory } from '../hooks/useDirectory';
import { useDirectoryCatalogs } from '../hooks/useDirectoryCatalogs';
import { BusinessCard } from './BusinessCard';
import { DirectoryFilterFields } from './DirectoryFilterFields';

function filtersOf({ activity, canton, district }: DirectoryFilters): DirectoryFilters {
  return { activity, canton, district };
}

// P-02: the chamber's affiliated businesses, searched by name or card code and
// filtered by place and activity. There is no filter by plan.
export function DirectoryPage({ initialSearch = '' }: { initialSearch?: string }) {
  const translate = useTranslations('public.directory');
  const directory = useDirectory(initialSearch);
  const catalogs = useDirectoryCatalogs();
  const { list, query } = directory;
  const filters = filtersOf(query);

  const clearAll = () => {
    directory.search('');
    directory.filter(NO_DIRECTORY_FILTERS);
  };

  const summary =
    list === null || list.total === 0
      ? undefined
      : translate('summary', {
          from: (list.page - 1) * list.pageSize + 1,
          to: (list.page - 1) * list.pageSize + list.items.length,
          total: list.total,
        });

  return (
    <div className="flex w-full flex-col gap-6 py-6 lg:gap-8 lg:py-12">
      <PageHeader title={translate('title')} />

      <div className="flex gap-3 lg:items-end">
        <div className="flex flex-1 lg:self-end">
          <SearchField
            label={translate('searchLabel')}
            placeholder={translate('searchPlaceholder')}
            value={directory.searchDraft}
            onChange={directory.search}
          />
        </div>
        <FilterSheet<DirectoryFilters>
          title={translate('filters.title')}
          value={filters}
          empty={NO_DIRECTORY_FILTERS}
          onApply={directory.filter}
          renderFields={(draft, change) => (
            <DirectoryFilterFields
              filters={draft}
              change={change}
              cantons={catalogs.cantons}
              activities={catalogs.activities}
            />
          )}
        />
      </div>

      <PagedList
        list={list}
        loading={directory.loading}
        failed={directory.failed}
        emptyState={
          <div className="flex flex-col items-center gap-4 rounded-lg border border-line-subtle bg-surface p-8 text-center">
            <span className="flex size-12 items-center justify-center rounded-full bg-brand-union-soft text-fg-brand">
              <Inbox aria-hidden className="size-6" />
            </span>
            <p className="text-heading-s text-fg">{translate('empty')}</p>
            <Button variant="secondary" onClick={clearAll}>
              {translate('clearFilters')}
            </Button>
          </div>
        }
        summary={summary}
        onPageChange={directory.showPage}
      >
        <ul
          aria-label={translate('title')}
          className="divide-y divide-line-subtle overflow-hidden rounded-lg border border-line-subtle bg-surface shadow-raised lg:grid lg:grid-cols-3 lg:gap-4 lg:divide-y-0 lg:overflow-visible lg:border-0 lg:bg-transparent lg:shadow-none xl:grid-cols-4"
        >
          {(list?.items ?? []).map((listing) => (
            <li key={listing.memberCode}>
              <BusinessCard listing={listing} />
            </li>
          ))}
        </ul>
      </PagedList>
    </div>
  );
}
