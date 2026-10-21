import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { NameCell } from '@/shared/components/DataList';
import { PlanBadge } from '@/shared/components/PlanBadge';
import { useDates } from '@/shared/hooks/useDates';
import type { AdminSummary } from '../api/summary';

export function ExpiringSoon({ expiring }: { expiring: AdminSummary['expiring'] }) {
  const translate = useTranslations('admin.summary.expiring');
  const dates = useDates();

  return (
    <section className="flex flex-col gap-4 rounded-lg border border-line-subtle bg-surface p-4 shadow-raised lg:p-6">
      <header className="flex items-center justify-between gap-3">
        <h2 className="text-heading-m text-fg">
          {translate('title', { days: expiring.noticeDays })}
        </h2>
        <Link
          href="/admin/memberships"
          className="inline-flex items-center gap-1 text-label-m text-fg-link hover:underline"
        >
          {translate('seeAll')}
          <ChevronRight aria-hidden className="size-4" />
        </Link>
      </header>

      {expiring.items.length === 0 ? (
        <p className="text-body-m text-fg-secondary">{translate('none')}</p>
      ) : (
        <ul className="divide-y divide-line-subtle">
          {expiring.items.map((membership) => (
            <li key={membership.memberId} className="flex items-center gap-3 py-3">
              <div className="min-w-0 flex-1">
                <NameCell name={membership.businessName} detail={membership.memberCode} />
              </div>
              {membership.plan !== null && (
                <span className="hidden lg:inline-flex">
                  <PlanBadge planKey={membership.plan.key} name={membership.plan.name} />
                </span>
              )}
              <p className="w-32 shrink-0 text-right text-body-s text-fg">
                {translate('expires', { date: dates.calendarDay(membership.validUntil, 'short') })}
              </p>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
