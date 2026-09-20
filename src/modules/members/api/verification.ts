import { requestApi } from '@/shared/api/request';
import type { MemberType } from './registration';

export type VerifiedMember = {
  memberCode: string;
  businessName: string;
  memberType: MemberType;
  sector: string | null;
  canton: string | null;
};

export type VerificationResult = { valid: false } | { valid: true; member: VerifiedMember };

// The code travels in the body rather than the path, so it does not end up in a
// browser history or a server access log.
export function verifyMemberCode(code: string): Promise<VerificationResult> {
  return requestApi<VerificationResult>('/api/members/verification', {
    method: 'POST',
    body: JSON.stringify({ code }),
  });
}
