import { requestApi } from '@/shared/api/apiClient';
import { buildApiUrl } from '@/shared/api/apiUrl';
import type { Paginated } from '@/shared/api/pagination';
import type { PlanKey } from '@/shared/api/planKey';
import type { PagedQuery } from '@/shared/hooks/usePagedList';

export type DirectoryListing = {
  memberCode: string;
  businessName: string;
  activity: string | null;
  logoFileKey: string | null;
  plan: { key: Exclude<PlanKey, 'free'>; name: string } | null;
  branch: { name: string; district: string | null } | null;
  otherBranches: number;
  online: boolean;
};

export type DirectoryFilters = { activity: string; canton: string; district: string };

export const NO_DIRECTORY_FILTERS: DirectoryFilters = { activity: '', canton: '', district: '' };

export function readDirectory({ search, page, ...filters }: PagedQuery<DirectoryFilters>) {
  const query = new URLSearchParams({ page: String(page) });

  for (const [name, value] of Object.entries({ search: search.trim(), ...filters })) {
    if (value !== '') {
      query.set(name, value);
    }
  }

  return requestApi<Paginated<DirectoryListing>>(`/api/directory?${query.toString()}`);
}

export function readDistricts(canton: string) {
  const query = new URLSearchParams({ canton });

  return requestApi<{ districts: string[] }>(`/api/directory/districts?${query.toString()}`);
}

// A logo is a public file, opened by its key like any other.
export function logoUrl(logoFileKey: string) {
  return buildApiUrl(`/api/files/${encodeURIComponent(logoFileKey)}`);
}

export type ShopDay =
  'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday';

export type ShopDayHours =
  | { day: ShopDay; closed: true }
  | { day: ShopDay; closed: false; opensAt: string | null; closesAt: string | null };

export type PublicBranch = {
  name: string;
  isPrimary: boolean;
  canton: string | null;
  district: string | null;
  address: string | null;
  phone: string | null;
  schedule: string | null;
};

export type PublicProfile = {
  memberCode: string;
  businessName: string;
  businessDescription: string | null;
  activity: string | null;
  canton: string | null;
  phone: string | null;
  whatsappNumber: string | null;
  instagram: string | null;
  facebook: string | null;
  linkedin: string | null;
  website: string | null;
  logoFileKey: string | null;
  affiliatedSince: string;
  plan: { key: Exclude<PlanKey, 'free'>; name: string } | null;
  branches: PublicBranch[];
  categories: string[];
  schedule: ShopDayHours[];
};

export function readPublicProfile(memberCode: string) {
  return requestApi<PublicProfile>(`/api/directory/${encodeURIComponent(memberCode)}`);
}
