'use client';

import Link from 'next/link';
import {
  Briefcase,
  CalendarDays,
  Check,
  ChevronLeft,
  Clock,
  Inbox,
  MapPin,
  ShieldCheck,
} from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Alert } from '@/shared/components/Alert';
import { Avatar } from '@/shared/components/Avatar';
import { buildApiUrl } from '@/shared/api/apiUrl';
import { useDates } from '@/shared/hooks/useDates';
import { publicProfilePath } from '@/shared/utils/publicProfilePath';
import type { BoardVacancyDetail } from '../api/vacancies';
import { useBoardVacancy } from '../hooks/useBoardVacancy';
import { requirementList } from '../requirementList';

const OUTLINE_LINK_CLASSES =
  'inline-flex min-h-11 items-center justify-center rounded-sm border border-secondary-border bg-surface px-4 text-label-m text-fg hover:bg-surface-hover focus-visible:shadow-focus focus-visible:outline-none lg:min-h-10';

function directionsHref(vacancy: BoardVacancyDetail) {
  const branch = vacancy.branch;
  const place = [branch?.address, branch?.district, branch?.canton, 'Costa Rica']
    .filter(Boolean)
    .join(', ');

  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(place)}`;
}

function VacancyBody({ vacancy }: { vacancy: BoardVacancyDetail }) {
  const translate = useTranslations('public.jobs.detail');
  const translateWorkday = useTranslations('public.jobs.workdays');
  const dates = useDates();
  const requirements = requirementList(vacancy.requirements);
  const place = [vacancy.branch?.district, vacancy.branch?.canton].filter(Boolean).join(', ');

  return (
    <article className="flex flex-col gap-6 rounded-lg border border-line-subtle bg-surface p-5 shadow-raised lg:p-8">
      <header className="flex flex-col gap-3">
        <h1 className="font-display text-heading-xl text-fg">{vacancy.title}</h1>
        <Link
          href={publicProfilePath(vacancy.business.memberCode)}
          className="self-start text-heading-s text-fg-link hover:underline"
        >
          {vacancy.business.name}
        </Link>
        <ul className="flex flex-wrap gap-x-5 gap-y-2 text-body-s text-fg-secondary">
          {place !== '' && (
            <li className="flex items-center gap-1.5">
              <MapPin aria-hidden className="size-4" />
              {place}
            </li>
          )}
          <li className="flex items-center gap-1.5">
            <Clock aria-hidden className="size-4" />
            {translateWorkday(vacancy.workday)}
          </li>
          <li className="flex items-center gap-1.5">
            <CalendarDays aria-hidden className="size-4" />
            {translate('published', { date: dates.instant(vacancy.publishedAt, 'short') })}
          </li>
        </ul>
      </header>

      <section className="flex flex-col gap-2">
        <h2 className="text-heading-m text-fg">{translate('whatYouDo')}</h2>
        <p className="text-body-m whitespace-pre-line text-fg-secondary">{vacancy.description}</p>
      </section>

      {requirements.length > 0 && (
        <section className="flex flex-col gap-2">
          <h2 className="text-heading-m text-fg">{translate('requirements')}</h2>
          <ul className="flex flex-col gap-2">
            {requirements.map((requirement) => (
              <li key={requirement} className="flex gap-2 text-body-m text-fg-secondary">
                <Check aria-hidden className="mt-1 size-4 shrink-0 text-fg-brand" />
                {requirement}
              </li>
            ))}
          </ul>
        </section>
      )}
    </article>
  );
}

function HowToApply({ vacancy }: { vacancy: BoardVacancyDetail }) {
  const translate = useTranslations('public.jobs.detail');

  return (
    <section className="flex flex-col gap-4 rounded-lg border border-primary bg-brand-union-soft p-5">
      <h2 className="flex items-center gap-2 text-heading-m text-fg-brand">
        <Briefcase aria-hidden className="size-5" />
        {translate('howToApply')}
      </h2>
      <p className="text-body-l whitespace-pre-line text-fg">{vacancy.howToApply}</p>
      {vacancy.branch !== null && (
        <a
          href={directionsHref(vacancy)}
          target="_blank"
          rel="noopener noreferrer"
          className={OUTLINE_LINK_CLASSES}
        >
          {translate('location')}
        </a>
      )}
      <p className="text-body-s text-fg-secondary">{translate('hiring')}</p>
    </section>
  );
}

function PostedBy({ vacancy }: { vacancy: BoardVacancyDetail }) {
  const translate = useTranslations('public.jobs.detail');
  const { business } = vacancy;

  return (
    <section className="flex flex-col gap-4 rounded-lg border border-line-subtle bg-surface p-5 shadow-raised">
      <p className="text-caption text-fg-muted">{translate('postedBy')}</p>
      <div className="flex items-center gap-3">
        <Avatar
          name={business.name}
          src={
            business.logoFileKey === null
              ? undefined
              : buildApiUrl(`/api/files/${encodeURIComponent(business.logoFileKey)}`)
          }
          size="m"
        />
        <div className="flex min-w-0 flex-col gap-1">
          <p className="text-label-l text-fg">{business.name}</p>
          <span className="inline-flex items-center gap-1.5 self-start rounded-full bg-success-soft px-2 py-0.5 text-label-s text-success">
            <ShieldCheck aria-hidden className="size-3.5" />
            {translate('verified')}
          </span>
        </div>
      </div>
      <Link href={publicProfilePath(business.memberCode)} className={OUTLINE_LINK_CLASSES}>
        {translate('seeBusiness')}
      </Link>
    </section>
  );
}

// P-10: one vacancy, how to apply and who posted it.
export function VacancyDetailPage({ vacancyId }: { vacancyId: string }) {
  const translate = useTranslations('public.jobs.detail');
  const translateErrors = useTranslations('errors');
  const state = useBoardVacancy(vacancyId);

  return (
    <div className="flex w-full flex-col gap-6 py-6 lg:py-10">
      <Link
        href="/jobs"
        className="inline-flex min-h-10 items-center gap-1 self-start text-label-m text-fg-link hover:underline"
      >
        <ChevronLeft aria-hidden className="size-4" />
        {translate('back')}
      </Link>

      {state.status === 'loading' && (
        <div aria-hidden className="h-64 animate-pulse rounded-lg bg-surface-hover" />
      )}
      {state.status === 'failed' && (
        <Alert tone="danger" title={translateErrors('network_error')} />
      )}
      {state.status === 'missing' && (
        <div className="flex flex-col items-center gap-4 rounded-lg border border-line-subtle bg-surface p-8 text-center">
          <span className="flex size-12 items-center justify-center rounded-full bg-brand-union-soft text-fg-brand">
            <Inbox aria-hidden className="size-6" />
          </span>
          <h1 className="text-heading-s text-fg">{translate('notAvailable')}</h1>
        </div>
      )}
      {state.status === 'loaded' && (
        <div className="grid items-start gap-6 lg:grid-cols-[1fr_22rem]">
          <VacancyBody vacancy={state.vacancy} />
          <aside className="flex flex-col gap-6">
            <HowToApply vacancy={state.vacancy} />
            <PostedBy vacancy={state.vacancy} />
          </aside>
        </div>
      )}
    </div>
  );
}
