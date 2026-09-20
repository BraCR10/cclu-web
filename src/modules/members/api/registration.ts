import { requestApi } from '@/shared/api/request';
import type { IdentificationType, MemberType } from '@/shared/config/memberTypes';

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
