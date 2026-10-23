import { requestApi } from '@/shared/api/apiClient';
import { pageQuery, type Paginated } from '@/shared/api/pagination';
import type { PublicationType } from './marketplace';

export type OwnPublication = {
  id: string;
  type: PublicationType;
  title: string;
  description: string;
  price: number | null;
  imageUrl: string | null;
  category: { _id: string; name: string } | null;
  percentage: number | null;
  condition: string | null;
  startsAt: string | null;
  endsAt: string | null;
  status: 'active' | 'inactive';
  // Set when the chamber took it down, which is why the member cannot put it
  // back.
  inactiveReason: string | null;
  publishedAt: string;
  updatedAt: string;
};

export type OwnPublicationList = Paginated<OwnPublication> & { canPublish: boolean };

// What the form sends. The API reads only what the type needs, so the rest
// travels empty and is not stored.
export type PublicationDraft = {
  type: PublicationType;
  title: string;
  description: string;
  price: string;
  imageUrl: string;
  category: string;
  percentage: string;
  condition: string;
  startsAt: string;
  endsAt: string;
};

export const OWN_PUBLICATION_PAGE_SIZE = 10;

export function readOwnPublications(type: PublicationType | '', page: number) {
  const query = new URLSearchParams(pageQuery(page, OWN_PUBLICATION_PAGE_SIZE));

  if (type !== '') {
    query.set('type', type);
  }

  return requestApi<OwnPublicationList>(`/api/members/me/publications?${query.toString()}`);
}

export function readOwnPublication(publicationId: string) {
  return requestApi<OwnPublication>(
    `/api/members/me/publications/${encodeURIComponent(publicationId)}`,
  );
}

export function createPublication(draft: PublicationDraft) {
  return requestApi<OwnPublication>('/api/members/me/publications', {
    method: 'POST',
    body: draft,
  });
}

export function updatePublication(publicationId: string, draft: PublicationDraft) {
  return requestApi<OwnPublication>(
    `/api/members/me/publications/${encodeURIComponent(publicationId)}`,
    { method: 'PATCH', body: draft },
  );
}

export function setPublicationStatus(publicationId: string, status: 'active' | 'inactive') {
  return requestApi<OwnPublication>(
    `/api/members/me/publications/${encodeURIComponent(publicationId)}/status`,
    { method: 'PATCH', body: { status } },
  );
}

export function deletePublication(publicationId: string) {
  return requestApi<void>(`/api/members/me/publications/${encodeURIComponent(publicationId)}`, {
    method: 'DELETE',
  });
}
