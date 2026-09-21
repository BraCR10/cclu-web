import { requestApi } from '@/shared/api/request';

export const REPORT_TYPES = {
  MEMBERS: 'members',
  PAID_MEMBERS: 'paid_members',
  UNPAID_MEMBERS: 'unpaid_members',
  PRODUCTS: 'products',
  PROMOTIONS: 'promotions',
  DISCOUNTS: 'discounts',
  JOBS: 'jobs',
} as const;

export type ReportType = (typeof REPORT_TYPES)[keyof typeof REPORT_TYPES];

export const REPORT_TYPE_LABELS: Record<ReportType, string> = {
  [REPORT_TYPES.MEMBERS]: 'Comercios afiliados (todos)',
  [REPORT_TYPES.PAID_MEMBERS]: 'Afiliados con membresía paga',
  [REPORT_TYPES.UNPAID_MEMBERS]: 'Afiliados con membresía no paga',
  [REPORT_TYPES.PRODUCTS]: 'Productos y servicios activos',
  [REPORT_TYPES.PROMOTIONS]: 'Promociones activas',
  [REPORT_TYPES.DISCOUNTS]: 'Descuentos para afiliados activos',
  [REPORT_TYPES.JOBS]: 'Vacantes activas en la Bolsa de Empleo',
};

// Member reports carry one row shape, publication reports another; the table
// renders whichever columns the row actually has.
export type MemberReportRow = {
  businessName: string;
  memberCode: string | null;
  email: string;
  canton: string | null;
  sector: string | null;
  membership: 'free' | 'paid';
};

export type PublicationReportRow = {
  title?: string;
  description?: string;
  businessName: string;
  canton: string | null;
  sector: string | null;
  validUntil?: string;
  createdAt: string;
};

export type ReportRow = MemberReportRow | PublicationReportRow;

export type Report = {
  type: ReportType;
  total: number;
  rows: ReportRow[];
};

export type ReportFilters = { canton?: string; sector?: string };

export function fetchReport(type: ReportType, filters: ReportFilters = {}): Promise<Report> {
  const params = new URLSearchParams({ type });

  if (filters.canton) {
    params.set('canton', filters.canton);
  }

  if (filters.sector) {
    params.set('sector', filters.sector);
  }

  return requestApi<Report>(`/api/admin/reports?${params.toString()}`);
}
