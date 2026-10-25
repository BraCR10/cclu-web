'use client';

import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { Alert } from '@/shared/components/Alert';
import { FilterSheet } from '@/shared/components/FilterSheet';
import { PageHeader } from '@/shared/components/PageHeader';
import { PagedList } from '@/shared/components/PagedList';
import { SearchField } from '@/shared/components/SearchField';
import { Select } from '@/shared/components/Select';
import { classNames } from '@/shared/utils/classNames';
import { PUBLICATION_TYPES, type PublicationType } from '../api/marketplace';
import { useMarketplace } from '../hooks/useMarketplace';
import { PublicationCard } from './PublicationCard';

// The three sections the marketplace is read in, as P-04, P-06 and P-08 draw
// them. They are tabs and not a filter: each one is a place a visitor can be
// sent to, by the footer, by the home page or by a link somebody shared.
const SECTIONS = [
  { id: 'products', href: '/marketplace', type: null },
  { id: 'promotions', href: '/promotions', type: 'promotion' },
  { id: 'discounts', href: '/discounts', type: 'discount' },
] as const;

type SectionId = (typeof SECTIONS)[number]['id'];

function sectionOf(type: PublicationType | undefined): SectionId {
  return SECTIONS.find((section) => section.type === (type ?? null))?.id ?? 'products';
}

type MarketplacePageProps = { type?: PublicationType };

// P-04, P-06 and P-08: what the businesses with a paid plan are offering, read
// whole or one kind at a time. Only what is inside its validity arrives; the
// API has already left out the promotions that ended.
export function MarketplacePage({ type }: MarketplacePageProps) {
  const translate = useTranslations('public.marketplace');
  const marketplace = useMarketplace(type === undefined ? undefined : { type });
  const { list, query } = marketplace;
  const section = sectionOf(type);
  const whole = section === 'products';

  const summary =
    list === null || list.total === 0
      ? undefined
      : translate(whole ? 'summary' : `summaries.${section}`, {
          from: (list.page - 1) * list.pageSize + 1,
          to: (list.page - 1) * list.pageSize + list.items.length,
          total: list.total,
        });

  return (
    <div className="flex w-full flex-col gap-6 py-6 lg:gap-8 lg:py-12">
      <PageHeader title={translate(whole ? 'title' : `titles.${section}`)} />

      <nav
        aria-label={translate('sectionsLabel')}
        className="-mx-4 flex gap-6 overflow-x-auto px-4 lg:mx-0 lg:px-0"
      >
        {SECTIONS.map((item) => {
          const active = item.id === section;

          return (
            <Link
              key={item.id}
              href={item.href}
              aria-current={active ? 'page' : undefined}
              className={classNames(
                'inline-flex min-h-11 shrink-0 items-center border-b-2 text-label-m lg:min-h-10',
                active
                  ? 'border-primary text-fg-brand'
                  : 'border-transparent text-fg-secondary hover:text-fg',
              )}
            >
              {translate(`tabs.${item.id}`)}
            </Link>
          );
        })}
      </nav>

      <div className="flex gap-3 lg:items-end">
        <div className="flex flex-1 lg:self-end">
          <SearchField
            label={translate('searchLabel')}
            placeholder={translate(whole ? 'searchPlaceholder' : `searchHints.${section}`)}
            value={marketplace.searchDraft}
            onChange={marketplace.search}
          />
        </div>
        {/* A section is already one kind, so the kind is not offered again. */}
        {whole && (
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
        )}
      </div>

      <PagedList
        list={list}
        loading={marketplace.loading}
        failed={marketplace.failed}
        emptyMessage={translate(whole ? 'empty' : `empties.${section}`)}
        summary={summary}
        onPageChange={marketplace.showPage}
      >
        <ul
          aria-label={translate(whole ? 'title' : `titles.${section}`)}
          className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
        >
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
