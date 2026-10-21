import Link from 'next/link';
import { Briefcase, CalendarDays, ChevronRight, Clock, MapPin } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useDates } from '@/shared/hooks/useDates';
import type { VacancyBranch, Workday } from '../api/vacancies';

type VacancyCardProps = {
  title: string;
  businessName: string;
  branch: VacancyBranch | null;
  workday: Workday | '';
  publishedAt: string | null;
  href?: string;
};

// A vacancy as the job board shows it. The member's form previews it with the
// same card, so what they see is what a visitor will.
export function VacancyCard({
  title,
  businessName,
  branch,
  workday,
  publishedAt,
  href,
}: VacancyCardProps) {
  const translate = useTranslations('public.jobs.card');
  const translateWorkday = useTranslations('public.jobs.workdays');
  const dates = useDates();
  const place =
    branch === null ? null : [branch.district, branch.canton].filter(Boolean).join(', ');

  return (
    <article className="flex flex-col gap-4 rounded-lg border border-line-subtle bg-surface p-4 shadow-raised">
      <div className="flex items-start gap-3">
        <span className="flex size-10 shrink-0 items-center justify-center rounded-md bg-brand-union-soft text-fg-brand">
          <Briefcase aria-hidden className="size-5" />
        </span>
        <div className="min-w-0">
          <h3 className="text-label-l break-words text-fg">{title || translate('untitled')}</h3>
          <p className="text-body-s text-fg-secondary">{businessName}</p>
        </div>
      </div>

      <ul className="flex flex-wrap gap-x-4 gap-y-2 text-body-s text-fg-secondary">
        {place && (
          <li className="flex items-center gap-1.5">
            <MapPin aria-hidden className="size-4" />
            {place}
          </li>
        )}
        {workday !== '' && (
          <li className="flex items-center gap-1.5">
            <Clock aria-hidden className="size-4" />
            {translateWorkday(workday)}
          </li>
        )}
        <li className="flex items-center gap-1.5">
          <CalendarDays aria-hidden className="size-4" />
          {publishedAt === null
            ? translate('publishedToday')
            : translate('published', { date: dates.instant(publishedAt, 'short') })}
        </li>
      </ul>

      {href !== undefined && (
        <Link
          href={href}
          className="inline-flex items-center gap-1 self-start border-t border-line-subtle pt-3 text-label-m text-fg-link hover:underline"
        >
          {translate('howToApply')}
          <ChevronRight aria-hidden className="size-4" />
        </Link>
      )}
    </article>
  );
}
