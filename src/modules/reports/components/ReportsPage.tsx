'use client';

import { useTranslations } from 'next-intl';
import { Alert } from '@/shared/components/Alert';
import { Button } from '@/shared/components/Button';
import { Card } from '@/shared/components/Card';
import { FilterSheet } from '@/shared/components/FilterSheet';
import { useIsDesktop } from '@/shared/hooks/useMediaQuery';
import { NO_REPORT_FILTERS } from '../api/reports';
import { useReports } from '../hooks/useReports';
import { ReportFilterFields } from './ReportFilterFields';
import { ReportResult } from './ReportResult';
import { ReportTypePicker } from './ReportTypePicker';

// A-10: the admin picks one of the chamber's reports, narrows it, generates it,
// reads it a page at a time and takes it away as CSV or PDF.
export function ReportsPage() {
  const translate = useTranslations('admin.reports');
  const isDesktop = useIsDesktop();
  const reports = useReports();
  const { definition } = reports;

  if (reports.catalogFailed) {
    return (
      <div className="px-4 py-6 lg:px-8 lg:py-8">
        <Alert tone="danger" title={translate('catalogFailed')} />
      </div>
    );
  }

  if (reports.catalog === null) {
    return (
      <div aria-hidden className="grid gap-3 px-4 py-6 lg:grid-cols-4 lg:px-8 lg:py-8">
        {Array.from({ length: 8 }, (_, index) => (
          <div key={index} className="h-16 animate-pulse rounded-lg bg-surface-hover" />
        ))}
      </div>
    );
  }

  const shown = definition?.filters ?? [];
  const generateButton = (
    <Button
      className="w-full lg:w-auto"
      disabled={!definition?.available}
      onClick={reports.generate}
    >
      {translate('generate')}
    </Button>
  );

  return (
    <div className="flex flex-col gap-6 px-4 py-6 lg:gap-8 lg:px-8 lg:py-8">
      <ReportTypePicker
        reports={reports.catalog}
        selected={definition?.type ?? null}
        onSelect={reports.select}
      />

      {isDesktop ? (
        <Card as="section" aria-label={translate('filtersTitle')} className="flex flex-col gap-4">
          <div className="grid grid-cols-4 items-end gap-4">
            <ReportFilterFields
              shown={shown}
              filters={reports.filters}
              change={reports.changeFilters}
            />
          </div>
          <div className="flex justify-end">{generateButton}</div>
        </Card>
      ) : (
        <div className="flex items-center gap-3">
          {shown.length > 0 && (
            <FilterSheet
              title={translate('filtersTitle')}
              value={reports.filters}
              empty={NO_REPORT_FILTERS}
              onApply={(filters) => reports.changeFilters(filters)}
              renderFields={(draft, change) => (
                <ReportFilterFields shown={shown} filters={draft} change={change} />
              )}
            />
          )}
          <div className="flex-1">{generateButton}</div>
        </div>
      )}

      {reports.generated ? (
        <ReportResult
          report={reports.report}
          loading={reports.loading}
          failed={reports.failed}
          exporting={reports.exporting}
          onExport={(format) => void reports.download(format)}
          onPageChange={reports.showPage}
        />
      ) : (
        <p className="rounded-lg border border-dashed border-line bg-surface-subtle p-6 text-center text-body-m text-fg-secondary">
          {translate('pending')}
        </p>
      )}
    </div>
  );
}
