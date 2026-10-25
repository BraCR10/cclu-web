import { requestApi } from '@/shared/api/apiClient';
import type { Paginated } from '@/shared/api/pagination';

export type ModerationKind = 'products' | 'promotions' | 'discounts' | 'vacancies';
export type ContentStatus = 'active' | 'inactive';

// One row per publication or vacancy, whichever tab it came from.
export type ModeratedContent = {
  id: string;
  title: string;
  type: string;
  status: ContentStatus;
  reason: string | null;
  member: string | null;
  memberId: string | null;
  publishedAt: string;
};

export type ModerationFilters = { status?: ContentStatus };

export const NO_MODERATION_FILTERS: ModerationFilters = {};

function query(filters: ModerationFilters, page: { page: number; search: string }) {
  const search = new URLSearchParams({ page: String(page.page) });

  if (page.search !== '') {
    search.set('search', page.search);
  }

  if (filters.status !== undefined) {
    search.set('status', filters.status);
  }

  return search.toString();
}

export function readModeration(
  kind: ModerationKind,
  filters: ModerationFilters,
  page: { page: number; search: string },
) {
  return requestApi<Paginated<ModeratedContent>>(
    `/api/admin/moderation/${kind}?${query(filters, page)}`,
  );
}

// Down keeps the item and its reason; up clears both. Neither deletes.
export function takeContentDown(kind: ModerationKind, contentId: string, reason: string) {
  return requestApi<ModeratedContent>(
    `/api/admin/moderation/${kind}/${encodeURIComponent(contentId)}/take-down`,
    { method: 'POST', body: { reason } },
  );
}

export function restoreContent(kind: ModerationKind, contentId: string) {
  return requestApi<ModeratedContent>(
    `/api/admin/moderation/${kind}/${encodeURIComponent(contentId)}/restore`,
    { method: 'POST' },
  );
}
