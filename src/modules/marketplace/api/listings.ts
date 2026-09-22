import { requestApi } from '@/shared/api/request';
import type { PublicationBusiness } from './business';

// The same shape wherever a listing is read: on the public marketplace, on
// its own page, or in a member's own list.
export type Listing = {
  id: string;
  title: string;
  description: string;
  price: number | null;
  category: string | null;
  imageUrl: string | null;
  isActive: boolean;
  createdAt: string;
  business: PublicationBusiness | null;
};

export type ListingPage = {
  items: Listing[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
};

export type ListingSearch = {
  page?: number;
  category?: string;
  name?: string;
  canton?: string;
  sector?: string;
};

export type ListingChanges = Partial<{
  title: string;
  description: string;
  price: number | '';
  category: string;
  isActive: boolean;
}>;

function listingQuery(search: ListingSearch): string {
  const params = new URLSearchParams();

  if (search.page) {
    params.set('page', String(search.page));
  }

  if (search.category) {
    params.set('category', search.category);
  }

  if (search.name) {
    params.set('name', search.name);
  }

  if (search.canton) {
    params.set('canton', search.canton);
  }

  if (search.sector) {
    params.set('sector', search.sector);
  }

  const query = params.toString();

  return query === '' ? '' : `?${query}`;
}

export function listListings(search: ListingSearch = {}): Promise<ListingPage> {
  return requestApi<ListingPage>(`/api/marketplace${listingQuery(search)}`);
}

export function fetchListing(id: string): Promise<Listing> {
  return requestApi<Listing>(`/api/marketplace/${encodeURIComponent(id)}`);
}

export function fetchOwnListings(): Promise<Listing[]> {
  return requestApi<Listing[]>('/api/members/me/marketplace');
}

export function createListing(changes: ListingChanges): Promise<Listing> {
  return requestApi<Listing>('/api/marketplace', {
    method: 'POST',
    body: JSON.stringify(changes),
  });
}

export function updateListing(id: string, changes: ListingChanges): Promise<Listing> {
  return requestApi<Listing>(`/api/marketplace/${encodeURIComponent(id)}`, {
    method: 'PATCH',
    body: JSON.stringify(changes),
  });
}

export function closeListing(id: string): Promise<void> {
  return requestApi<void>(`/api/marketplace/${encodeURIComponent(id)}`, { method: 'DELETE' });
}

export async function uploadListingImage(
  id: string,
  contentType: string,
  content: string,
): Promise<string> {
  const { imageUrl } = await requestApi<{ imageUrl: string }>(
    `/api/marketplace/${encodeURIComponent(id)}/image`,
    { method: 'POST', body: JSON.stringify({ contentType, content }) },
  );

  return imageUrl;
}

export function deleteListingImage(id: string): Promise<void> {
  return requestApi<void>(`/api/marketplace/${encodeURIComponent(id)}/image`, {
    method: 'DELETE',
  });
}
