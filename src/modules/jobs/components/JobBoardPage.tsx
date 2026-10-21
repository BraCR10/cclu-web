'use client';

import { useTranslations } from 'next-intl';
import { Alert } from '@/shared/components/Alert';
import { FilterSheet } from '@/shared/components/FilterSheet';
import { PageHeader } from '@/shared/components/PageHeader';
import { PagedList } from '@/shared/components/PagedList';
import { SearchField } from '@/shared/components/SearchField';
import { NO_BOARD_FILTERS, type BoardFilters } from '../api/vacancies';
import { useCantons, useJobBoard } from '../hooks/useJobBoard';
import { JobFilterFields } from './JobFilterFields';
import { VacancyCard } from './VacancyCard';

function filtersOf({ canton, district, workday }: BoardFilters): BoardFilters {
  return { canton, district, workday };
}

// P-09: the vacancies of affiliated businesses, searched by job title and
// filtered by place and workday.
export function JobBoardPage() {
  const translate = useTranslations('public.jobs');
  const board = useJobBoard();
  const cantons = useCantons();
  const { list, query } = board;

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
            value={board.searchDraft}
            onChange={board.search}
          />
        </div>
        <FilterSheet<BoardFilters>
          title={translate('filters.title')}
          value={filtersOf(query)}
          empty={NO_BOARD_FILTERS}
          onApply={board.filter}
          renderFields={(draft, change) => (
            <JobFilterFields filters={draft} change={change} cantons={cantons} />
          )}
        />
      </div>

      <PagedList
        list={list}
        loading={board.loading}
        failed={board.failed}
        emptyMessage={translate('empty')}
        summary={summary}
        onPageChange={board.showPage}
      >
        <ul aria-label={translate('title')} className="grid gap-4 lg:grid-cols-3">
          {(list?.items ?? []).map((vacancy) => (
            <li key={vacancy.id}>
              <VacancyCard
                title={vacancy.title}
                businessName={vacancy.business.name}
                branch={vacancy.branch}
                workday={vacancy.workday}
                publishedAt={vacancy.publishedAt}
                href={`/jobs/${vacancy.id}`}
              />
            </li>
          ))}
        </ul>
      </PagedList>

      <Alert
        tone="info"
        title={translate('noResumes.title')}
        message={translate('noResumes.message')}
      />
    </div>
  );
}
