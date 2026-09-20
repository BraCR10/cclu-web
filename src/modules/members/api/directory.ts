import { requestApi } from '@/shared/api/request';
import type { MemberType } from './registration';

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
