import { requestApi } from '@/shared/api/apiClient';
import { pageQuery, type Paginated } from '@/shared/api/pagination';

export type PublicationType = 'product' | 'service' | 'promotion' | 'discount';

export const PUBLICATION_TYPES: PublicationType[] = ['product', 'service', 'promotion', 'discount'];

export type MarketplaceBusiness = {
  businessName: string;
  memberCode: string | null;
  district: string | null;
  canton: string | null;
  logoUrl: string | null;
};

export type MarketplacePublication = {
  id: string;
  type: PublicationType;
  title: string;
  description: string;
  price: number | null;
  imageUrl: string | null;
  category: { _id: string; name: string } | null;
  percentage: number | null;
  condition: string | null;
  // Calendar days, so a promotion reads the same everywhere.
  startsAt: string | null;
  endsAt: string | null;
  publishedAt: string;
  business: MarketplaceBusiness | null;
};

export const MARKETPLACE_PAGE_SIZE = 12;

export type MarketplaceFilters = { type: PublicationType | '' };

export const NO_MARKETPLACE_FILTERS: MarketplaceFilters = { type: '' };

export function readMarketplace({
  type,
  search,
  page,
}: MarketplaceFilters & { search: string; page: number }) {
  const query = new URLSearchParams(pageQuery(page, MARKETPLACE_PAGE_SIZE));

  if (type !== '') {
    query.set('type', type);
  }

  if (search !== '') {
    query.set('search', search);
  }

  return requestApi<Paginated<MarketplacePublication>>(`/api/marketplace?${query.toString()}`);
}

export function readMarketplaceItem(publicationId: string) {
  return requestApi<MarketplacePublication>(
    `/api/marketplace/${encodeURIComponent(publicationId)}`,
  );
}
