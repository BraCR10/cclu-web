import { useTranslations } from 'next-intl';
import { classNames } from '@/shared/utils/classNames';
import type { AdminMembershipList, MembershipListView } from '../api/adminMemberships';

type MembershipCountsProps = {
  counts: AdminMembershipList['counts'] | null;
  noticeDays: number | null;
  view: MembershipListView;
  onSelect: (view: MembershipListView) => void;
};

// Each figure is also the view it counts: every active membership, the part of
// them that ends within the notice, or the ones that already ran out.
export function MembershipCounts({ counts, noticeDays, view, onSelect }: MembershipCountsProps) {
  const translate = useTranslations('admin.memberships.counts');

  function card(cardView: MembershipListView) {
    const selected = view === cardView;

    return (
      <button
        type="button"
        aria-pressed={selected}
        onClick={() => onSelect(cardView)}
        className={classNames(
          'flex min-h-11 flex-col items-start gap-1 rounded-lg border bg-surface p-3 text-left shadow-raised focus-visible:shadow-focus focus-visible:outline-none lg:p-5',
          selected
            ? 'border-2 border-primary bg-brand-union-soft'
            : 'border-line-subtle hover:bg-surface-hover',
        )}
      >
        <span className="font-display text-heading-l text-fg lg:text-metric-l">
          {counts?.[cardView] ?? 0}
        </span>
        <span
          className={classNames('text-body-s', selected ? 'text-fg-brand' : 'text-fg-secondary')}
        >
          {translate(cardView, { days: noticeDays ?? 0 })}
        </span>
      </button>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-2 lg:grid-cols-3 lg:gap-4">
      {card('active')}
      {card('expiring')}
      {card('expired')}
    </div>
  );
}
