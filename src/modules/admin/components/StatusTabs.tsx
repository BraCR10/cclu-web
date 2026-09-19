'use client';

import type { ComponentType } from 'react';
import { CheckCircleIcon, ClockIcon, CrossCircleIcon } from '@/shared/components/icons';

export type InboxView = 'pending' | 'approved' | 'rejected';

type TabDefinition = {
  view: InboxView;
  label: string;
  Icon: ComponentType<{ className?: string }>;
};

const TABS: TabDefinition[] = [
  { view: 'pending', label: 'Pendientes', Icon: ClockIcon },
  { view: 'approved', label: 'Aprobadas', Icon: CheckCircleIcon },
  { view: 'rejected', label: 'Rechazadas', Icon: CrossCircleIcon },
];

type StatusTabsProps = {
  active: InboxView;
  counts: Record<InboxView, number>;
  onSelect: (view: InboxView) => void;
};

// The counts are the navigation. Showing them twice, once as a summary and
// again as tabs, would be the same fact competing with itself.
export function StatusTabs({ active, counts, onSelect }: StatusTabsProps) {
  return (
    <div
      role="tablist"
      aria-label="Estado de las solicitudes"
      className="grid gap-4 sm:grid-cols-3"
    >
      {TABS.map(({ view, label, Icon }) => {
        const selected = view === active;

        return (
          <button
            key={view}
            type="button"
            role="tab"
            aria-selected={selected}
            onClick={() => onSelect(view)}
            className={`flex items-center gap-4 rounded-panel border p-5 text-left transition-all ${
              selected
                ? 'border-brand bg-surface-raised shadow-md'
                : 'border-border bg-surface-raised hover:border-content-muted'
            }`}
          >
            <span
              className={`flex size-11 shrink-0 items-center justify-center rounded-control ${
                selected ? 'bg-brand text-on-brand' : 'bg-surface text-content-muted'
              }`}
            >
              <Icon />
            </span>

            <span className="flex min-w-0 flex-col">
              <span className="text-2xl leading-tight font-semibold tabular-nums">
                {counts[view]}
              </span>
              <span className="text-sm text-content-muted">{label}</span>
            </span>
          </button>
        );
      })}
    </div>
  );
}
