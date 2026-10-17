import { useTranslations } from 'next-intl';
import { classNames } from '@/shared/utils/classNames';
import type { AdminMembershipList, MembershipListStatus } from '../api/adminMemberships';

type MembershipCountsProps = {
  counts: AdminMembershipList['counts'] | null;
  noticeDays: number | null;
  status: MembershipListStatus;
  onSelect: (status: MembershipListStatus) => void;
};

const CARD_CLASSES =
  'flex flex-col items-start gap-1 rounded-lg border bg-surface p-3 text-left shadow-raised lg:p-5';

function Figure({ value }: { value: number | null }) {
  return <span className="font-display text-heading-l text-fg lg:text-metric-l">{value ?? 0}</span>;
}

// Two of the three are the list's two states and switch it. Expiring soon is
// only a figure: a plan expiring soon is still active, and is listed there
// first.
export function MembershipCounts({ counts, noticeDays, status, onSelect }: MembershipCountsProps) {
  const translate = useTranslations('admin.memberships.counts');

  function stateCard(cardStatus: MembershipListStatus) {
    const selected = status === cardStatus;

    return (
      <button
        type="button"
        aria-pressed={selected}
        onClick={() => onSelect(cardStatus)}
        className={classNames(
          CARD_CLASSES,
          'min-h-11 focus-visible:shadow-focus focus-visible:outline-none',
          selected
            ? 'border-2 border-primary bg-brand-union-soft'
            : 'border-line-subtle hover:bg-surface-hover',
        )}
      >
        <Figure value={counts?.[cardStatus] ?? null} />
        <span
          className={classNames('text-body-s', selected ? 'text-fg-brand' : 'text-fg-secondary')}
        >
          {translate(cardStatus)}
        </span>
      </button>
    );
  }

  return (
    <div className="grid grid-cols-3 gap-2 lg:gap-4">
      {stateCard('active')}
      <div className={classNames(CARD_CLASSES, 'border-line-subtle')}>
        <Figure value={counts?.expiring ?? null} />
        <span className="text-body-s text-fg-secondary">
          {translate('expiring', { days: noticeDays ?? 0 })}
        </span>
      </div>
      {stateCard('inactive')}
    </div>
  );
}
