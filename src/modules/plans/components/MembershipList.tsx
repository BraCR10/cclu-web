import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { DataList, NameCell, type DataColumn } from '@/shared/components/DataList';
import { ListCard } from '@/shared/components/ListCard';
import { useDates } from '@/shared/hooks/useDates';
import type { AdminMembership } from '../api/adminMemberships';
import { PlanBadge } from '@/shared/components/PlanBadge';

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

function PlanCell({ membership }: { membership: AdminMembership }) {
  const translate = useTranslations('admin.memberships');

  return membership.plan === null ? (
    <span className="text-body-s text-fg-muted">{translate('none')}</span>
  ) : (
    <PlanBadge planKey={membership.plan.key} name={membership.plan.name} />
  );
}

export function MembershipList({ items }: { items: AdminMembership[] }) {
  const translate = useTranslations('admin.memberships');
  const text = useMembershipText();
  const viewLabel = (membership: AdminMembership) =>
    translate('viewMemberNamed', { name: membership.businessName });

  const columns: DataColumn<AdminMembership>[] = [
    {
      id: 'member',
      header: translate('columns.member'),
      cell: (membership) => (
        <NameCell name={membership.businessName} detail={membership.memberCode} />
      ),
    },
    {
      id: 'plan',
      header: translate('columns.plan'),
      cell: (membership) => <PlanCell membership={membership} />,
    },
    { id: 'frequency', header: translate('columns.frequency'), cell: text.frequency },
    { id: 'lastPayment', header: translate('columns.lastPayment'), cell: text.lastPayment },
    { id: 'expires', header: translate('columns.expires'), cell: text.end },
    {
      id: 'actions',
      header: translate('columns.actions'),
      hideHeader: true,
      align: 'end',
      cell: (membership) => (
        <Link
          href={memberHref(membership)}
          aria-label={viewLabel(membership)}
          className="inline-flex min-h-10 items-center gap-1 rounded-sm px-2 text-label-m whitespace-nowrap text-fg-link hover:bg-surface-hover focus-visible:shadow-focus focus-visible:outline-none"
        >
          {translate('viewMember')}
          <ChevronRight aria-hidden className="size-4" />
        </Link>
      ),
    },
  ];

  return (
    <DataList
      label={translate('tableLabel')}
      items={items}
      keyOf={(membership) => membership.memberId}
      columns={columns}
      card={(membership) => (
        <ListCard
          name={membership.businessName}
          line={translate('cardLine', {
            code: membership.memberCode,
            end: text.end(membership),
            frequency: text.frequency(membership),
          })}
          badges={<PlanCell membership={membership} />}
          href={memberHref(membership)}
          linkLabel={viewLabel(membership)}
        />
      )}
    />
  );
}
