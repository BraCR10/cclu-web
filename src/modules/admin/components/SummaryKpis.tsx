import Link from 'next/link';
import {
  Briefcase,
  ClipboardList,
  CreditCard,
  Receipt,
  ShoppingBag,
  TrendingUp,
  Users,
  type LucideIcon,
} from 'lucide-react';
import { useTranslations } from 'next-intl';
import type { AdminSummary } from '../api/summary';

type KpiId =
  'members' | 'applications' | 'payments' | 'paidMemberships' | 'publications' | 'vacancies';

type Kpi = {
  id: KpiId;
  icon: LucideIcon;
  value: number | null;
  href: string;
  growth?: number;
};

function KpiCard({ kpi }: { kpi: Kpi }) {
  const translate = useTranslations('admin.summary.kpis');
  const Icon = kpi.icon;

  return (
    <Link
      href={kpi.href}
      className="flex flex-col gap-3 rounded-lg border border-line-subtle bg-surface p-4 shadow-raised hover:bg-surface-hover focus-visible:shadow-focus focus-visible:outline-none lg:p-5"
    >
      <div className="flex items-center justify-between gap-2">
        <span className="flex size-10 items-center justify-center rounded-md bg-brand-union-soft text-fg-brand">
          <Icon aria-hidden className="size-5" />
        </span>
        {kpi.growth !== undefined && kpi.growth > 0 && (
          <span className="inline-flex items-center gap-1 rounded-full bg-success-soft px-2 py-0.5 text-label-s whitespace-nowrap text-success">
            <TrendingUp aria-hidden className="size-3.5" />
            {translate('thisMonth', { count: kpi.growth })}
          </span>
        )}
      </div>
      <p className="font-display text-display-section text-fg">
        {kpi.value === null ? '—' : kpi.value}
      </p>
      <p className="text-body-m text-fg-secondary">
        {kpi.value === null
          ? translate('underConstruction', { label: translate(kpi.id) })
          : translate(kpi.id)}
      </p>
    </Link>
  );
}

// Each figure leads to the screen that lists it.
export function SummaryKpis({ summary }: { summary: AdminSummary }) {
  const kpis: Kpi[] = [
    {
      id: 'members',
      icon: Users,
      value: summary.members.total,
      growth: summary.members.newThisMonth,
      href: '/admin/members',
    },
    {
      id: 'applications',
      icon: ClipboardList,
      value: summary.applications.pending,
      href: '/admin/applications',
    },
    { id: 'payments', icon: Receipt, value: summary.payments.pending, href: '/admin/payments' },
    {
      id: 'paidMemberships',
      icon: CreditCard,
      value: summary.paidMemberships.active,
      growth: summary.paidMemberships.newThisMonth,
      href: '/admin/memberships',
    },
    // Publications are not built yet, so the figure says so rather than a zero.
    { id: 'publications', icon: ShoppingBag, value: null, href: '/admin/moderation' },
    { id: 'vacancies', icon: Briefcase, value: summary.vacancies.active, href: '/jobs' },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-3 lg:gap-4">
      {kpis.map((kpi) => (
        <KpiCard key={kpi.id} kpi={kpi} />
      ))}
    </div>
  );
}
