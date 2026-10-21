'use client';

import { useState } from 'react';
import {
  BadgePercent,
  Briefcase,
  ChevronDown,
  Clock,
  CreditCard,
  FileText,
  Mail,
  Megaphone,
  Package,
  Sparkles,
  Store,
  Wallet,
  type LucideIcon,
} from 'lucide-react';
import { useTranslations } from 'next-intl';
import { BottomSheet } from '@/shared/components/BottomSheet';
import { Button } from '@/shared/components/Button';
import { useIsDesktop } from '@/shared/hooks/useMediaQuery';
import { classNames } from '@/shared/utils/classNames';
import type { ReportDefinition } from '../api/reports';

const ICONS: Record<string, LucideIcon> = {
  members: Store,
  paidMembers: CreditCard,
  freeMembers: Wallet,
  newMembers: Sparkles,
  expiringMemberships: Clock,
  activeVacancies: Briefcase,
  periodPayments: FileText,
  subscribers: Mail,
  products: Package,
  promotions: Megaphone,
  discounts: BadgePercent,
};

type ReportTypePickerProps = {
  reports: ReportDefinition[];
  selected: string | null;
  onSelect: (type: string) => void;
};

function ReportOption({
  report,
  checked,
  onSelect,
}: {
  report: ReportDefinition;
  checked: boolean;
  onSelect: (type: string) => void;
}) {
  const translate = useTranslations('admin.reports');
  const Icon = ICONS[report.type] ?? FileText;

  return (
    <label
      className={classNames(
        'flex min-h-16 items-center gap-3 rounded-lg border bg-surface p-3 shadow-raised has-focus-visible:shadow-focus',
        checked ? 'border-primary bg-brand-union-soft' : 'border-line-subtle',
        report.available
          ? 'cursor-pointer hover:bg-surface-hover'
          : 'cursor-not-allowed opacity-60',
      )}
    >
      <input
        type="radio"
        name="report-type"
        className="sr-only"
        value={report.type}
        checked={checked}
        disabled={!report.available}
        onChange={() => onSelect(report.type)}
      />
      <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-surface-hover text-fg-secondary">
        <Icon aria-hidden className="size-5" />
      </span>
      <span className="flex flex-col">
        <span className="text-label-m text-fg">{report.title}</span>
        {!report.available && (
          <span className="text-body-s text-fg-muted">{translate('unavailable')}</span>
        )}
      </span>
    </label>
  );
}

function ReportOptions({ reports, selected, onSelect }: ReportTypePickerProps) {
  const translate = useTranslations('admin.reports');

  return (
    <fieldset>
      <legend className="sr-only">{translate('chooseType')}</legend>
      <div className="grid gap-3 lg:grid-cols-4">
        {reports.map((report) => (
          <ReportOption
            key={report.type}
            report={report}
            checked={report.type === selected}
            onSelect={onSelect}
          />
        ))}
      </div>
    </fieldset>
  );
}

// The report to generate. On a desktop every report is in view; on a telephone
// the current one opens a sheet that scrolls, and the choice counts once
// applied.
export function ReportTypePicker({ reports, selected, onSelect }: ReportTypePickerProps) {
  const translate = useTranslations('admin.reports');
  const isDesktop = useIsDesktop();
  const [draft, setDraft] = useState<string | null>(null);

  if (isDesktop) {
    return (
      <section aria-labelledby="report-catalog" className="flex flex-col gap-3">
        <h2 id="report-catalog" className="text-label-l text-fg">
          {translate('catalogLabel')}
        </h2>
        <ReportOptions reports={reports} selected={selected} onSelect={onSelect} />
      </section>
    );
  }

  const current = reports.find((report) => report.type === selected);

  return (
    <>
      <button
        type="button"
        onClick={() => setDraft(selected)}
        className="flex min-h-12 w-full items-center justify-between gap-3 rounded-sm border border-line bg-surface px-4 text-left focus-visible:shadow-focus focus-visible:outline-none"
      >
        <span className="flex flex-col">
          <span className="text-label-s text-fg-muted">{translate('chooseType')}</span>
          <span className="text-label-m text-fg">{current?.title ?? ''}</span>
        </span>
        <ChevronDown aria-hidden className="size-5 text-fg-muted" />
      </button>

      <BottomSheet
        open={draft !== null}
        title={translate('chooseType')}
        onClose={() => setDraft(null)}
        footer={
          <Button
            className="w-full"
            onClick={() => {
              if (draft !== null) {
                onSelect(draft);
              }
              setDraft(null);
            }}
          >
            {translate('apply')}
          </Button>
        }
      >
        <ReportOptions reports={reports} selected={draft} onSelect={setDraft} />
      </BottomSheet>
    </>
  );
}
