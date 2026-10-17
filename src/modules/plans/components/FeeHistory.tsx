import { ChevronDown } from 'lucide-react';
import { useFormatter, useTranslations } from 'next-intl';
import type { Paginated } from '@/shared/api/pagination';
import { Card } from '@/shared/components/Card';
import { Pagination } from '@/shared/components/Pagination';
import { formatColones } from '@/shared/utils/formatColones';
import type { FeeChange } from '../api/fees';
import { PlanBadge } from './PlanBadge';

const DATE_FORMAT = {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
} as const;

// A table where there is room for five columns, and one card per change on a
// telephone, folded so the fees stay the first thing on screen.
type FeeHistoryProps = {
  history: Paginated<FeeChange>;
  onPageChange: (page: number) => void;
};

export function FeeHistory({ history, onPageChange }: FeeHistoryProps) {
  const translate = useTranslations('admin.plans.history');
  const format = useFormatter();
  const dateOf = (change: FeeChange) => format.dateTime(new Date(change.occurredAt), DATE_FORMAT);

  if (history.total === 0) {
    return (
      <Card as="section" aria-labelledby="fee-history">
        <h2 id="fee-history" className="font-display text-heading-m text-fg">
          {translate('title')}
        </h2>
        <p className="mt-2 text-body-m text-fg-secondary">{translate('empty')}</p>
      </Card>
    );
  }

  return (
    <Card as="section" aria-labelledby="fee-history">
      <details open className="group lg:hidden">
        <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between focus-visible:shadow-focus focus-visible:outline-none [&::-webkit-details-marker]:hidden">
          <h2 id="fee-history" className="font-display text-heading-m text-fg">
            {translate('title')}
          </h2>
          <ChevronDown
            aria-hidden
            className="size-5 text-fg-secondary transition-transform group-open:rotate-180"
          />
        </summary>
        <ul className="mt-4 flex flex-col gap-3">
          {history.items.map((change) => (
            <li key={change.id} className="rounded-md border border-line-subtle p-3">
              <p className="text-label-m text-fg">{change.plan.name}</p>
              <p className="text-body-m text-fg">
                {translate('change', {
                  previous: formatColones(change.previousFee),
                  next: formatColones(change.newFee),
                })}
              </p>
              <p className="text-body-s text-fg-muted">
                {translate('byline', { date: dateOf(change), name: change.changedBy })}
              </p>
            </li>
          ))}
        </ul>
      </details>

      <div className="hidden lg:block">
        <h2 className="font-display text-heading-m text-fg">{translate('title')}</h2>
        <div className="mt-4 overflow-hidden rounded-md border border-line-subtle">
          <table className="w-full border-collapse text-left">
            <thead className="bg-surface-subtle text-label-s text-fg-secondary">
              <tr>
                <th scope="col" className="px-4 py-3">
                  {translate('date')}
                </th>
                <th scope="col" className="px-4 py-3">
                  {translate('plan')}
                </th>
                <th scope="col" className="px-4 py-3 text-right">
                  {translate('previousFee')}
                </th>
                <th scope="col" className="px-4 py-3 text-right">
                  {translate('newFee')}
                </th>
                <th scope="col" className="px-4 py-3">
                  {translate('changedBy')}
                </th>
              </tr>
            </thead>
            <tbody className="text-body-m text-fg">
              {history.items.map((change) => (
                <tr key={change.id} className="border-t border-line-subtle">
                  <td className="px-4 py-4 text-fg-secondary">{dateOf(change)}</td>
                  <td className="px-4 py-4">
                    {change.plan.key === null ? (
                      change.plan.name
                    ) : (
                      <PlanBadge planKey={change.plan.key} name={change.plan.name} />
                    )}
                  </td>
                  <td className="px-4 py-4 text-right">{formatColones(change.previousFee)}</td>
                  <td className="px-4 py-4 text-right">{formatColones(change.newFee)}</td>
                  <td className="px-4 py-4">{change.changedBy}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <div className="mt-4">
        <Pagination page={history.page} pageCount={history.pageCount} onPageChange={onPageChange} />
      </div>
    </Card>
  );
}
