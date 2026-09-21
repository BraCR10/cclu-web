import { requestApi } from '@/shared/api/request';
import type { MemberType } from '@/shared/config/memberTypes';

// What the chamber shows about a business to anyone who scans its card. The
// API builds this field by field; nothing administrative can reach it.
export type PublicProfile = {
  memberCode: string;
  businessName: string;
  businessDescription: string;
  memberType: MemberType;
  sector: string | null;
  canton: string | null;
  province: string | null;
  location: string;
  phone: string;
  whatsappNumber: string | null;
  instagram: string | null;
  facebook: string | null;
  linkedin: string | null;
  website: string | null;
  logoUrl: string | null;
  affiliatedSince: string;
};

export function fetchPublicProfile(memberCode: string): Promise<PublicProfile> {
  return requestApi<PublicProfile>(`/api/directory/${encodeURIComponent(memberCode)}`);
}

// One entry in the roll, in the same shape a single card answers with: a
// listing is not a summary, it is many of the same thing.
export type DirectoryEntry = PublicProfile;

export type DirectorySearch = {
  name?: string;
  canton?: string;
  sector?: string;
  page?: number;
};

export type DirectoryPage = {
  items: DirectoryEntry[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
};

function directoryQuery(search: DirectorySearch): string {
  const params = new URLSearchParams();

  if (search.name) {
    params.set('name', search.name);
  }

  if (search.canton) {
    params.set('canton', search.canton);
  }

  if (search.sector) {
    params.set('sector', search.sector);
  }

  if (search.page) {
    params.set('page', String(search.page));
  }

  const query = params.toString();

  return query === '' ? '' : `?${query}`;
}

export function searchDirectory(search: DirectorySearch = {}): Promise<DirectoryPage> {
  return requestApi<DirectoryPage>(`/api/directory${directoryQuery(search)}`);
}
