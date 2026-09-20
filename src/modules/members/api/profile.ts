import { requestApi } from '@/shared/api/request';
import type { Canton, Sector } from './registration';
import type { IdentificationType, MemberType } from '@/shared/config/memberTypes';

export const MEMBER_STATES = {
  UNDER_REVIEW: 'under_review',
  ACTIVE: 'active',
  SUSPENDED: 'suspended',
  REJECTED: 'rejected',
} as const;

export type MemberState = (typeof MEMBER_STATES)[keyof typeof MEMBER_STATES];

export type MemberProfile = {
  _id: string;
  email: string;
  phone: string;
  location: string;
  businessName: string;
  businessDescription: string;
  memberType: MemberType;
  identificationType: IdentificationType;
  identificationNumber: string;
  memberCode?: string | null;
  statusReason?: string;
  createdAt: string;
  state: MemberState;
  canton: Canton | null;
  sector: Sector | null;
  whatsappNumber?: string;
  instagram?: string;
  facebook?: string;
  linkedin?: string;
  website?: string;
  logoUrl?: string;
};

// Only the fields the API accepts. Sending anything else would be answered the
// same way, but there is no reason to ask for something that is refused.
export type ProfileChanges = Partial<{
  phone: string;
  location: string;
  businessName: string;
  businessDescription: string;
  memberType: MemberType;
  canton: string;
  sector: string;
  whatsappNumber: string;
  instagram: string;
  facebook: string;
  linkedin: string;
  website: string;
  logoUrl: string;
}>;

export function fetchOwnProfile(): Promise<MemberProfile> {
  return requestApi<MemberProfile>('/api/members/me');
}

export function updateOwnProfile(changes: ProfileChanges): Promise<MemberProfile> {
  return requestApi<MemberProfile>('/api/members/me', {
    method: 'PATCH',
    body: JSON.stringify(changes),
  });
}
