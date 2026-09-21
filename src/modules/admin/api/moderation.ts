import { requestApi } from '@/shared/api/request';

export const PUBLICATION_TYPES = {
  PRODUCTS: 'products',
  PROMOTIONS: 'promotions',
  DISCOUNTS: 'discounts',
  JOBS: 'jobs',
} as const;

export type PublicationType = (typeof PUBLICATION_TYPES)[keyof typeof PUBLICATION_TYPES];

export const PUBLICATION_TYPE_LABELS: Record<PublicationType, string> = {
  [PUBLICATION_TYPES.PRODUCTS]: 'Productos y servicios',
  [PUBLICATION_TYPES.PROMOTIONS]: 'Promociones',
  [PUBLICATION_TYPES.DISCOUNTS]: 'Descuentos para afiliados',
  [PUBLICATION_TYPES.JOBS]: 'Vacantes',
};

export type AdminStatus = 'active' | 'inactive' | 'blocked';

export const ADMIN_STATUS_LABELS: Record<AdminStatus, string> = {
  active: 'Activa',
  inactive: 'Inactivada por la Cámara',
  blocked: 'Bloqueada permanentemente',
};

export type ModeratedPublication = {
  id: string;
  type: PublicationType;
  title: string;
  isActive: boolean;
  adminStatus: AdminStatus;
  validUntil?: string;
  createdAt: string;
  business: { businessName: string; memberCode: string | null };
};

export type ModerationPage = {
  items: ModeratedPublication[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
};

export type ModerationAction = 'deactivate' | 'reactivate' | 'block';

export function fetchPublications(type: PublicationType, page = 1): Promise<ModerationPage> {
  return requestApi<ModerationPage>(`/api/admin/publications?type=${type}&page=${page}`);
}

export function moderatePublication(
  type: PublicationType,
  id: string,
  action: ModerationAction,
): Promise<ModeratedPublication> {
  return requestApi<ModeratedPublication>(
    `/api/admin/publications/${type}/${encodeURIComponent(id)}/moderation`,
    { method: 'POST', body: JSON.stringify({ action }) },
  );
}
