'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Lock, Plus, Sparkles, Trash2 } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Button } from '@/shared/components/Button';
import { DataList, type DataColumn } from '@/shared/components/DataList';
import { ListCard } from '@/shared/components/ListCard';
import { Modal } from '@/shared/components/Modal';
import { PagedList } from '@/shared/components/PagedList';
import { StatusBadge } from '@/shared/components/StatusBadge';
import { useDates } from '@/shared/hooks/useDates';
import type { Vacancy } from '../api/vacancies';
import { useOwnVacancies } from '../hooks/useOwnVacancies';

const LINK_BUTTON_CLASSES =
  'inline-flex min-h-11 items-center justify-center gap-2 rounded-sm px-4 text-label-m focus-visible:shadow-focus focus-visible:outline-none lg:min-h-10';

function PlanRequired() {
  const translate = useTranslations('member.vacancies.locked');

  return (
    <div className="flex flex-col items-center gap-4 rounded-lg border border-line-subtle bg-surface p-8 text-center shadow-raised">
      <span className="flex size-14 items-center justify-center rounded-full bg-warning-soft text-warning">
        <Lock aria-hidden className="size-6" />
      </span>
      <h2 className="text-heading-m text-fg">{translate('title')}</h2>
      <div className="flex flex-wrap items-center justify-center gap-4">
        <Link
          href="/member/membership"
          className={`${LINK_BUTTON_CLASSES} bg-primary text-on-primary hover:bg-primary-hover`}
        >
          <Sparkles aria-hidden className="size-4" />
          {translate('seePlans')}
        </Link>
        <Link href="/plans" className={`${LINK_BUTTON_CLASSES} text-fg-link hover:underline`}>
          {translate('compare')}
        </Link>
      </div>
    </div>
  );
}

// M-09: the member's vacancies, or what unlocks publishing them.
export function MyVacanciesPage() {
  const translate = useTranslations('member.vacancies');
  const translateWorkday = useTranslations('public.jobs.workdays');
  const dates = useDates();
  const vacancies = useOwnVacancies();
  const [deleting, setDeleting] = useState<Vacancy | null>(null);
  const { list } = vacancies;

  const status = (vacancy: Vacancy) => (
    <StatusBadge
      tone={vacancy.status === 'active' ? 'success' : 'neutral'}
      label={translate(`status.${vacancy.status}`)}
    />
  );

  const deleteButton = (vacancy: Vacancy) => (
    <Button
      variant="ghost"
      size="s"
      aria-label={translate('deleteNamed', { title: vacancy.title })}
      onClick={() => setDeleting(vacancy)}
    >
      <Trash2 aria-hidden className="size-4" />
    </Button>
  );

  const columns: DataColumn<Vacancy>[] = [
    {
      id: 'title',
      header: translate('columns.title'),
      cell: (vacancy) => (
        <div className="min-w-0">
          <p className="truncate text-body-m text-fg">{vacancy.title}</p>
          <p className="text-body-s text-fg-muted">{vacancy.branch?.name ?? ''}</p>
        </div>
      ),
    },
    {
      id: 'workday',
      header: translate('columns.workday'),
      cell: (vacancy) => translateWorkday(vacancy.workday),
    },
    {
      id: 'published',
      header: translate('columns.published'),
      cell: (vacancy) => dates.instant(vacancy.publishedAt, 'short'),
    },
    { id: 'status', header: translate('columns.status'), cell: status },
    {
      id: 'actions',
      header: translate('columns.actions'),
      hideHeader: true,
      align: 'end',
      cell: deleteButton,
    },
  ];

  return (
    <div className="flex flex-col gap-6 px-4 py-6 lg:gap-8 lg:px-8 lg:py-8">
      {list !== null && !list.canPublish && <PlanRequired />}

      {list !== null && list.canPublish && (
        <div>
          <Link
            href="/member/vacancies/new"
            className={`${LINK_BUTTON_CLASSES} bg-primary text-on-primary hover:bg-primary-hover`}
          >
            <Plus aria-hidden className="size-4" />
            {translate('new')}
          </Link>
        </div>
      )}

      {(list === null || list.canPublish || list.total > 0) && (
        <PagedList
          list={list}
          loading={vacancies.loading}
          failed={vacancies.failed}
          emptyMessage={translate('empty')}
          onPageChange={vacancies.showPage}
        >
          <DataList
            label={translate('title')}
            items={list?.items ?? []}
            keyOf={(vacancy) => vacancy.id}
            columns={columns}
            card={(vacancy) => (
              <ListCard
                name={vacancy.title}
                line={[vacancy.branch?.name, translateWorkday(vacancy.workday)]
                  .filter(Boolean)
                  .join(' · ')}
                badges={status(vacancy)}
                action={deleteButton(vacancy)}
              />
            )}
          />
        </PagedList>
      )}

      <Modal
        open={deleting !== null}
        title={translate('confirmDelete.title')}
        onClose={() => setDeleting(null)}
        footer={
          <div className="flex gap-3 lg:justify-end">
            <Button
              variant="secondary"
              className="flex-1 lg:flex-none"
              onClick={() => setDeleting(null)}
            >
              {translate('confirmDelete.cancel')}
            </Button>
            <Button
              variant="danger"
              className="flex-1 lg:flex-none"
              onClick={() => {
                if (deleting !== null) {
                  void vacancies.remove(deleting.id);
                }
                setDeleting(null);
              }}
            >
              {translate('confirmDelete.confirm')}
            </Button>
          </div>
        }
      >
        <p className="text-body-m text-fg-secondary">
          {translate('confirmDelete.message', { title: deleting?.title ?? '' })}
        </p>
      </Modal>
    </div>
  );
}
