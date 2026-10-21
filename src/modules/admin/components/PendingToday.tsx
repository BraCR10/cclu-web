import Link from 'next/link';
import { ClipboardList, Receipt, type LucideIcon } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useDates } from '@/shared/hooks/useDates';
import type { AdminSummary } from '../api/summary';

type PendingRow = {
  id: 'applications' | 'payments';
  icon: LucideIcon;
  count: number;
  oldest: string | null;
  href: string;
};

export function PendingToday({ summary }: { summary: AdminSummary }) {
  const translate = useTranslations('admin.summary.pending');
  const dates = useDates();
  const rows: PendingRow[] = [
    {
      id: 'applications',
      icon: ClipboardList,
      count: summary.applications.pending,
      oldest: summary.applications.oldestSubmittedAt,
      href: '/admin/applications',
    },
    {
      id: 'payments',
      icon: Receipt,
      count: summary.payments.pending,
      oldest: summary.payments.oldestSubmittedAt,
      href: '/admin/payments',
    },
  ];

  return (
    <section className="flex flex-col gap-4 rounded-lg border border-line-subtle bg-surface p-4 shadow-raised lg:p-6">
      <h2 className="text-heading-m text-fg">{translate('title')}</h2>
      <ul className="grid gap-4 lg:grid-cols-2">
        {rows.map(({ id, icon: Icon, count, oldest, href }) => (
          <li key={id} className="flex items-center gap-3">
            <span className="flex size-10 shrink-0 items-center justify-center rounded-md bg-surface-subtle text-fg-secondary">
              <Icon aria-hidden className="size-5" />
            </span>
            <div className="flex min-w-0 flex-1 flex-col gap-0.5">
              <p className="text-label-l text-fg">{translate(`${id}.count`, { count })}</p>
              {oldest !== null && (
                <p className="text-body-s text-fg-muted">
                  {translate('oldest', { date: dates.instant(oldest, 'short') })}
                </p>
              )}
            </div>
            {count > 0 && (
              <Link
                href={href}
                className="inline-flex min-h-10 shrink-0 items-center rounded-sm border border-secondary-border px-3 text-label-m text-fg hover:bg-surface-hover focus-visible:shadow-focus focus-visible:outline-none"
              >
                {translate(`${id}.review`)}
              </Link>
            )}
          </li>
        ))}
      </ul>
    </section>
  );
}
