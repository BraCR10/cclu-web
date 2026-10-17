import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Avatar } from '@/shared/components/Avatar';
import { StatusBadge } from '@/shared/components/StatusBadge';
import { useDates } from '@/shared/hooks/useDates';
import type { AdminMembership } from '../api/adminMemberships';
import { PlanBadge } from './PlanBadge';

// The member's own page in the panel. It shows "En construcción" until the
// member detail is built.
function memberHref(membership: AdminMembership) {
  return `/admin/members/${encodeURIComponent(membership.memberId)}`;
}

function useMembershipText() {
  const translate = useTranslations('admin.memberships');
  const dates = useDates();
  const none = translate('none');

  return {
    frequency: (membership: AdminMembership) =>
      membership.frequency === null ? none : translate(`frequencies.${membership.frequency}`),
    lastPayment: (membership: AdminMembership) =>
      membership.lastPaymentAt === null ? none : dates.instant(membership.lastPaymentAt, 'short'),
    end: (membership: AdminMembership) =>
      membership.expiresAt === null ? none : dates.termEnd(membership.expiresAt, 'short'),
  };
}

function StateBadge({ membership }: { membership: AdminMembership }) {
  const translate = useTranslations('admin.memberships.status');
  const isActive = membership.status === 'active';

  return (
    <StatusBadge tone={isActive ? 'success' : 'neutral'} label={translate(membership.status)} />
  );
}

function PlanCell({ membership }: { membership: AdminMembership }) {
  const translate = useTranslations('admin.memberships');

  return membership.plan === null ? (
    <span className="text-body-s text-fg-muted">{translate('none')}</span>
  ) : (
    <PlanBadge planKey={membership.plan.key} name={membership.plan.name} />
  );
}

export function MembershipTable({ items }: { items: AdminMembership[] }) {
  const ended = items[0]?.status === 'inactive';
  const translate = useTranslations('admin.memberships');
  const text = useMembershipText();
  const columns = ['member', 'plan', 'frequency', 'lastPayment', 'expires', 'status'] as const;

  return (
    <div className="hidden overflow-hidden rounded-lg border border-line-subtle bg-surface shadow-raised lg:block">
      <table className="w-full border-collapse text-left">
        <caption className="sr-only">{translate('tableLabel')}</caption>
        <thead className="bg-surface-subtle">
          <tr>
            {columns.map((column) => (
              <th key={column} scope="col" className="px-4 py-3 text-label-s text-fg-secondary">
                {translate(`columns.${column === 'expires' && ended ? 'ended' : column}`)}
              </th>
            ))}
            <th scope="col" className="px-4 py-3">
              <span className="sr-only">{translate('columns.actions')}</span>
            </th>
          </tr>
        </thead>
        <tbody>
          {items.map((membership) => (
            <tr key={membership.memberId} className="border-t border-line-subtle">
              <td className="px-4 py-3">
                <div className="flex items-center gap-3">
                  <Avatar name={membership.businessName} size="s" />
                  <div className="min-w-0">
                    <p className="truncate text-body-m text-fg">{membership.businessName}</p>
                    <p className="text-body-s text-fg-muted">{membership.memberCode}</p>
                  </div>
                </div>
              </td>
              <td className="px-4 py-3">
                <PlanCell membership={membership} />
              </td>
              <td className="px-4 py-3 text-body-m text-fg">{text.frequency(membership)}</td>
              <td className="px-4 py-3 text-body-m text-fg">{text.lastPayment(membership)}</td>
              <td className="px-4 py-3 text-body-m text-fg">{text.end(membership)}</td>
              <td className="px-4 py-3">
                <StateBadge membership={membership} />
              </td>
              <td className="px-4 py-3 text-right">
                <Link
                  href={memberHref(membership)}
                  aria-label={translate('viewMemberNamed', { name: membership.businessName })}
                  className="inline-flex min-h-10 items-center gap-1 rounded-sm px-2 text-label-m whitespace-nowrap text-fg-link hover:bg-surface-hover focus-visible:shadow-focus focus-visible:outline-none"
                >
                  {translate('viewMember')}
                  <ChevronRight aria-hidden className="size-4" />
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function MembershipCards({ items }: { items: AdminMembership[] }) {
  const translate = useTranslations('admin.memberships');
  const text = useMembershipText();

  return (
    <ul
      aria-label={translate('tableLabel')}
      className="divide-y divide-line-subtle overflow-hidden rounded-lg border border-line-subtle bg-surface shadow-raised lg:hidden"
    >
      {items.map((membership) => (
        <li key={membership.memberId}>
          <Link
            href={memberHref(membership)}
            aria-label={translate('viewMemberNamed', { name: membership.businessName })}
            className="flex min-h-11 items-center gap-3 p-4 hover:bg-surface-hover focus-visible:shadow-focus focus-visible:outline-none"
          >
            <Avatar name={membership.businessName} size="m" />
            <div className="flex min-w-0 flex-1 flex-col gap-1">
              <p className="truncate text-label-m text-fg">{membership.businessName}</p>
              <p className="text-body-s text-fg-muted">
                {translate(membership.status === 'inactive' ? 'cardLineEnded' : 'cardLine', {
                  code: membership.memberCode,
                  end: text.end(membership),
                  frequency: text.frequency(membership),
                })}
              </p>
              <div className="flex flex-wrap items-center gap-2">
                <PlanCell membership={membership} />
                <StateBadge membership={membership} />
              </div>
            </div>
            <ChevronRight aria-hidden className="size-5 shrink-0 text-fg-muted" />
          </Link>
        </li>
      ))}
    </ul>
  );
}
