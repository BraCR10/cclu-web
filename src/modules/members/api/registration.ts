import { requestApi } from '@/shared/api/request';

export const MEMBER_TYPES = {
  BUSINESS: 'business',
  INDEPENDENT_PROFESSIONAL: 'independent_professional',
} as const;

export const IDENTIFICATION_TYPES = {
  NATIONAL_ID: 'national_id',
  LEGAL_ENTITY_ID: 'legal_entity_id',
  PASSPORT: 'passport',
  DIMEX: 'dimex',
} as const;

export type MemberType = (typeof MEMBER_TYPES)[keyof typeof MEMBER_TYPES];
export type IdentificationType = (typeof IDENTIFICATION_TYPES)[keyof typeof IDENTIFICATION_TYPES];

export type Canton = { _id: string; name: string; province: string };
export type Sector = { _id: string; name: string };

export type Registration = {
  email: string;
  phone: string;
  canton: string;
  location: string;
  sector: string;
  memberType: MemberType;
  identificationType: IdentificationType;
  identificationNumber: string;
  businessName: string;
  businessDescription: string;
  password: string;
  whatsappNumber?: string;
  instagram?: string;
  facebook?: string;
  linkedin?: string;
  website?: string;
};

export function fetchCantons(): Promise<Canton[]> {
  return requestApi<Canton[]>('/api/cantons');
}

export function fetchSectors(): Promise<Sector[]> {
  return requestApi<Sector[]>('/api/sectors');
}

export function registerMember(registration: Registration): Promise<{ id: string }> {
  return requestApi<{ id: string }>('/api/members', {
    method: 'POST',
    body: JSON.stringify(registration),
  });
}
