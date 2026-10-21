import { Download } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Button } from '@/shared/components/Button';
import { Card } from '@/shared/components/Card';
import { DataList } from '@/shared/components/DataList';
import { ListCard } from '@/shared/components/ListCard';
import { PagedList } from '@/shared/components/PagedList';
import { REPORT_PAGE_SIZE, type ExportFormat, type Report } from '../api/reports';

type ReportResultProps = {
  report: Report | null;
  loading: boolean;
  failed: boolean;
  exporting: ExportFormat | null;
  onExport: (format: ExportFormat) => void;
  onPageChange: (page: number) => void;
};

type Row = { key: string; cells: string[] };

// A-10b and A-10c: the generated report, its totals, its rows a page at a time
// and the two files that hold every row.
export function ReportResult({
  report,
  loading,
  failed,
  exporting,
  onExport,
  onPageChange,
}: ReportResultProps) {
  const translate = useTranslations('admin.reports');
  const rows: Row[] = (report?.items ?? []).map((cells, index) => ({
    key: `${report?.page ?? 0}-${index}`,
    cells,
  }));
  const summary =
    report === null || report.total === 0
      ? undefined
      : translate('summary', {
          from: (report.page - 1) * REPORT_PAGE_SIZE + 1,
          to: (report.page - 1) * REPORT_PAGE_SIZE + report.items.length,
          total: report.total,
        });

  return (
    <Card as="section" aria-labelledby="report-result" className="flex flex-col gap-5">
      {report !== null && (
        <>
          <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <h2 id="report-result" className="font-display text-heading-m text-fg">
                {report.title}
              </h2>
              <p className="text-body-s text-fg-secondary">{report.description}</p>
            </div>
            <div className="grid grid-cols-2 gap-3 lg:flex">
              {(['csv', 'pdf'] as const).map((format) => (
                <Button
                  key={format}
                  variant="secondary"
                  loading={exporting === format}
                  disabled={exporting !== null || report.total === 0}
                  onClick={() => onExport(format)}
                >
                  <Download aria-hidden className="size-4" />
                  {translate(format === 'csv' ? 'exportCsv' : 'exportPdf')}
                </Button>
              ))}
            </div>
          </div>

          <dl className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            {report.summary.map((entry) => (
              <div key={entry.label} className="rounded-md bg-surface-subtle p-4">
                <dd className="font-display text-metric-l text-fg">{entry.value}</dd>
                <dt className="text-body-s text-fg-secondary">{entry.label}</dt>
              </div>
            ))}
          </dl>
        </>
      )}

      <PagedList
        list={report}
        loading={loading}
        failed={failed}
        emptyMessage={translate('empty')}
        summary={summary}
        onPageChange={onPageChange}
      >
        <DataList
          label={report?.title ?? ''}
          items={rows}
          keyOf={(row) => row.key}
          columns={(report?.columns ?? []).map((column, index) => ({
            id: `${index}`,
            header: column,
            cell: (row: Row) => row.cells[index] || '—',
          }))}
          card={(row) => (
            <ListCard
              name={row.cells[0] ?? ''}
              line={row.cells.slice(1).filter(Boolean).join(' · ')}
            />
          )}
        />
      </PagedList>
    </Card>
  );
}
