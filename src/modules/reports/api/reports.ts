import { requestApi, requestFile } from '@/shared/api/apiClient';
import type { Paginated } from '@/shared/api/pagination';

export type ReportFilterName =
  'canton' | 'district' | 'plan' | 'memberType' | 'activity' | 'accountStatus' | 'from' | 'to';

export type ReportFilters = Record<ReportFilterName, string>;

export const NO_REPORT_FILTERS: ReportFilters = {
  canton: '',
  district: '',
  plan: '',
  memberType: '',
  activity: '',
  accountStatus: '',
  from: '',
  to: '',
};

export type ReportDefinition = {
  type: string;
  title: string;
  filters: ReportFilterName[];
  available: boolean;
};

// The API writes every value once, so the preview shows exactly what the CSV
// and the PDF hold: a row is the cells in the order of the columns.
export type Report = Paginated<string[]> & {
  type: string;
  title: string;
  description: string;
  summary: { label: string; value: string }[];
  columns: string[];
};

export type ExportFormat = 'csv' | 'pdf';

export const REPORT_PAGE_SIZE = 10;

function reportQuery(filters: Partial<ReportFilters>, extra: Record<string, string> = {}) {
  const query = new URLSearchParams(extra);

  for (const [name, value] of Object.entries(filters)) {
    if (value !== '' && value !== undefined) {
      query.set(name, value);
    }
  }

  return query.toString();
}

export function readReportCatalog() {
  return requestApi<{ items: ReportDefinition[] }>('/api/admin/reports');
}

export function readReport(type: string, filters: Partial<ReportFilters>, page: number) {
  return requestApi<Report>(
    `/api/admin/reports/${encodeURIComponent(type)}?${reportQuery(filters, {
      page: String(page),
      pageSize: String(REPORT_PAGE_SIZE),
    })}`,
  );
}

export function exportReport(type: string, filters: Partial<ReportFilters>, format: ExportFormat) {
  return requestFile(
    `/api/admin/reports/${encodeURIComponent(type)}/export?${reportQuery(filters, { format })}`,
  );
}
