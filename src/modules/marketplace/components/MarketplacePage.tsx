'use client';

import { useTranslations } from 'next-intl';
import { Alert } from '@/shared/components/Alert';
import { FilterSheet } from '@/shared/components/FilterSheet';
import { PageHeader } from '@/shared/components/PageHeader';
import { PagedList } from '@/shared/components/PagedList';
import { SearchField } from '@/shared/components/SearchField';
import { Select } from '@/shared/components/Select';
import { PUBLICATION_TYPES, type PublicationType } from '../api/marketplace';
import { useMarketplace } from '../hooks/useMarketplace';
import { PublicationCard } from './PublicationCard';

// P-10: what the businesses with a paid plan are offering, searched by name and
// filtered by the kind of publication.
export function MarketplacePage() {
  const translate = useTranslations('public.marketplace');
  const marketplace = useMarketplace();
  const { list, query } = marketplace;

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
            value={marketplace.searchDraft}
            onChange={marketplace.search}
          />
        </div>
        <FilterSheet<{ type: PublicationType | '' }>
          title={translate('filters.title')}
          value={{ type: query.type }}
          empty={{ type: '' }}
          onApply={(filters) => marketplace.filter(filters)}
          renderFields={(draft, change) => (
            <Select
              label={translate('filters.type')}
              name="type"
              value={draft.type}
              options={[
                { value: '', label: translate('filters.all') },
                ...PUBLICATION_TYPES.map((type) => ({
                  value: type,
                  label: translate(`types.${type}`),
                })),
              ]}
              onChange={(event) => change({ type: event.target.value as PublicationType | '' })}
            />
          )}
        />
      </div>

      <PagedList
        list={list}
        loading={marketplace.loading}
        failed={marketplace.failed}
        emptyMessage={translate('empty')}
        summary={summary}
        onPageChange={marketplace.showPage}
      >
        <ul aria-label={translate('title')} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {(list?.items ?? []).map((publication) => (
            <li key={publication.id}>
              <PublicationCard publication={publication} href={`/marketplace/${publication.id}`} />
            </li>
          ))}
        </ul>
      </PagedList>

      <Alert tone="info" title={translate('note.title')} message={translate('note.message')} />
    </div>
  );
}
