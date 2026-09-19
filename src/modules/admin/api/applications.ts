import { requestApi } from '@/shared/api/request';

export type MemberType = 'business' | 'independent_professional';

export type IdentificationType = 'national_id' | 'legal_entity_id' | 'passport' | 'dimex';

type NamedReference = { _id: string; name: string };

export type PendingApplication = {
  _id: string;
  email: string;
  phone: string;
  location: string;
  memberType: MemberType;
  identificationType: IdentificationType;
  identificationNumber: string;
  businessName: string;
  businessDescription: string;
  logoUrl?: string;
  whatsappNumber?: string;
  instagram?: string;
  facebook?: string;
  linkedin?: string;
  website?: string;
  createdAt: string;
  canton: (NamedReference & { province: string }) | null;
  sector: NamedReference | null;
};

export type DecidedApplication = {
  _id: string;
  businessName: string;
  email: string;
  memberType: MemberType;
  identificationType: IdentificationType;
  identificationNumber: string;
  applicationStatus: 'approved' | 'rejected';
  statusReason?: string;
  memberCode?: string;
  reviewedAt: string;
  createdAt: string;
  reviewedBy: { _id: string; email: string } | null;
  sector: NamedReference | null;
};

export type ApplicationDecision = {
  applicationStatus: string;
  statusReason?: string;
  memberCode?: string;
  reviewedAt: string;
};

export function fetchPendingApplications(): Promise<PendingApplication[]> {
  return requestApi<PendingApplication[]>('/api/admin/applications/pending');
}

export function fetchDecidedApplications(): Promise<DecidedApplication[]> {
  return requestApi<DecidedApplication[]>('/api/admin/applications/decided');
}

export function approveApplication(memberId: string): Promise<ApplicationDecision> {
  return requestApi<ApplicationDecision>(`/api/admin/applications/${memberId}/approve`, {
    method: 'POST',
  });
}

export function rejectApplication(memberId: string, reason: string): Promise<ApplicationDecision> {
  return requestApi<ApplicationDecision>(`/api/admin/applications/${memberId}/reject`, {
    method: 'POST',
    body: JSON.stringify({ reason }),
  });
}
