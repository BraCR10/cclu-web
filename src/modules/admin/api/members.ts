import { requestApi, requestFile } from '@/shared/api/apiClient';
import type { Paginated } from '@/shared/api/pagination';

export type AccountStatus = 'active' | 'suspended';
export type MemberType = 'business' | 'association' | 'independent_professional';
export type PlanKey = 'free' | 'lite' | 'pro' | 'premium';

export type MemberRow = {
  id: string;
  businessName: string | null;
  name: string | null;
  email: string;
  phone: string | null;
  memberType: MemberType;
  memberCode: string | null;
  accountStatus: AccountStatus;
  canton: string | null;
  district: string | null;
  joinedAt: string;
  plan: { key: PlanKey | null; name: string | null; expiresAt: string | null } | null;
};

export type MemberPayment = {
  id: string;
  planName: string;
  amount: number;
  status: string;
  submittedAt: string;
  decidedAt: string | null;
};

export type MemberPublication = {
  id: string;
  title: string;
  type: string;
  status: string;
  publishedAt: string;
};

export type MemberDetail = MemberRow & {
  identificationType: string;
  identificationNumber: string;
  legalName: string | null;
  legalRepresentativeName: string | null;
  businessDescription: string | null;
  activity: string | null;
  location: string | null;
  whatsappNumber: string | null;
  billingEmail: string | null;
  institutionalPhone: string | null;
  website: string | null;
  instagram: string | null;
  facebook: string | null;
  linkedin: string | null;
  membership: {
    status: string;
    startedAt: string;
    expiresAt: string | null;
    frequency: string | null;
  } | null;
  payments: MemberPayment[];
  publications: MemberPublication[];
};

export type MemberFilters = {
  accountStatus?: AccountStatus;
  memberType?: MemberType;
  plan?: PlanKey;
};

// Every key present, all undefined: the filter sheet counts what differs from
// this object, so a key that is absent could never be counted as set.
export const NO_MEMBER_FILTERS: MemberFilters = {
  accountStatus: undefined,
  memberType: undefined,
  plan: undefined,
};

export const MEMBER_PAGE_SIZE = 10;

// What an administrator may correct. The address, the document and the trade are
// what the application was decided on, so they are not offered here.
export type ContactChanges = {
  phone?: string;
  whatsappNumber?: string;
  billingEmail?: string;
  website?: string;
  instagram?: string;
  facebook?: string;
  linkedin?: string;
};

function memberQuery(filters: MemberFilters, query: { page: number; search: string }) {
  const search = new URLSearchParams();

  search.set('page', String(query.page));

  if (query.search !== '') {
    search.set('search', query.search);
  }

  if (filters.accountStatus !== undefined) {
    search.set('accountStatus', filters.accountStatus);
  }

  if (filters.memberType !== undefined) {
    search.set('memberType', filters.memberType);
  }

  if (filters.plan !== undefined) {
    search.set('plan', filters.plan);
  }

  return search.toString();
}

export function readMembers(filters: MemberFilters, query: { page: number; search: string }) {
  return requestApi<Paginated<MemberRow>>(`/api/admin/members?${memberQuery(filters, query)}`);
}

export function exportMembers(filters: MemberFilters, search: string) {
  return requestFile(`/api/admin/members/export?${memberQuery(filters, { page: 1, search })}`);
}

export function readMember(memberId: string) {
  return requestApi<MemberDetail>(`/api/admin/members/${encodeURIComponent(memberId)}`);
}

export function updateMember(memberId: string, changes: ContactChanges) {
  return requestApi<MemberDetail>(`/api/admin/members/${encodeURIComponent(memberId)}`, {
    method: 'PATCH',
    body: changes,
  });
}

export function setMemberStatus(memberId: string, status: AccountStatus, reason: string) {
  return requestApi<MemberDetail>(`/api/admin/members/${encodeURIComponent(memberId)}/status`, {
    method: 'PATCH',
    body: { status, reason },
  });
}
