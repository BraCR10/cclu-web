import { requestApi } from '@/shared/api/apiClient';
import type { Paginated } from '@/shared/api/pagination';

export type ApplicationStatus = 'pending_review' | 'changes_requested' | 'approved' | 'rejected';

export type ApplicationView = 'pending' | 'decided';

type Reference = { _id: string; name: string };

// What both lists show. The detail adds the decision and the documents; the
// fields the panel never needs (the password hash) are absent from the API's
// answer as well, not merely from this type.
export type ApplicationSummary = {
  _id: string;
  businessName?: string | null;
  name?: string | null;
  email: string;
  memberType: string;
  identificationType: string;
  identificationNumber: string;
  activity?: Reference | null;
  activityOther?: string | null;
  applicationStatus: ApplicationStatus;
  statusReason?: string | null;
  changesRequestedFields?: { field: string; message: string }[];
  memberCode?: string | null;
  reviewedAt?: string | null;
  createdAt: string;
};

export type ApplicationDetail = ApplicationSummary & {
  phone?: string;
  whatsappNumber?: string;
  legalName?: string | null;
  legalRepresentativeName?: string | null;
  legalRepresentativeIdentification?: string | null;
  managerName?: string | null;
  businessDescription?: string | null;
  canton?: { _id: string; name: string; province: string } | null;
  district?: string | null;
  location?: string | null;
  branchModality?: string | null;
  branchName?: string | null;
  institutionalPhone?: string | null;
  billingEmail?: string | null;
  instagram?: string | null;
  facebook?: string | null;
  linkedin?: string | null;
  website?: string | null;
  certificationFileKey?: string | null;
  logoFileKey?: string | null;
  reviewedBy?: { _id: string; email: string } | null;
};

export type ApplicationPage = Paginated<ApplicationSummary>;

export function readApplications(view: ApplicationView, query: { page: number; search: string }) {
  const search = query.search === '' ? '' : `&search=${encodeURIComponent(query.search)}`;

  return requestApi<ApplicationPage>(`/api/admin/applications/${view}?page=${query.page}${search}`);
}

export function readApplication(memberId: string) {
  return requestApi<ApplicationDetail>(`/api/admin/applications/${encodeURIComponent(memberId)}`);
}

export function approveApplication(memberId: string) {
  return requestApi<ApplicationDetail>(
    `/api/admin/applications/${encodeURIComponent(memberId)}/approve`,
    { method: 'POST' },
  );
}

export function rejectApplication(memberId: string, reason: string) {
  return requestApi<ApplicationDetail>(
    `/api/admin/applications/${encodeURIComponent(memberId)}/reject`,
    { method: 'POST', body: { reason } },
  );
}

// The middle answer: the applicant keeps their application and is told what to fix.
export function requestChangesApplication(memberId: string, reason: string) {
  return requestApi<ApplicationDetail>(
    `/api/admin/applications/${encodeURIComponent(memberId)}/request-changes`,
    { method: 'POST', body: { reason } },
  );
}

// The certification and the logo are private, so they travel through the admin
// file route rather than a public address.
export function applicationFileUrl(key: string) {
  return `/api/admin/files/${encodeURIComponent(key)}`;
}
