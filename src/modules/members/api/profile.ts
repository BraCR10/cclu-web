import { requestApi } from '@/shared/api/apiClient';

// What the API answers about the member signed in. The two statuses never
// travel on their own: what arrives is the state they add up to. A field the
// record does not hold arrives as null, which an account approved before that
// field existed does for the branch, the district and how to reach it.
export type MemberProfile = {
  _id: string;
  state: 'active' | 'pending_review' | 'rejected' | 'changes_requested' | 'suspended';
  memberType: '' | 'business' | 'association' | 'independent_professional';
  identificationType: string;
  identificationNumber: string;
  memberCode: string | null;
  name: string | null;
  legalName: string | null;
  legalRepresentativeName: string | null;
  legalRepresentativeIdentification: string | null;
  certificationFileKey: string | null;
  certificationIssuedAt: string | null;
  businessName: string;
  managerName: string | null;
  businessDescription: string | null;
  logoFileKey: string | null;
  logoUrl: string | null;
  branchModality: 'physical' | 'virtual';
  branchName: string | null;
  canton: { _id: string; name: string; province: string } | null;
  district: string | null;
  location: string | null;
  institutionalPhone: string | null;
  activity: { _id: string; name: string } | null;
  activityOther: string | null;
  email: string;
  phone: string | null;
  whatsappNumber: string | null;
  billingEmail: string | null;
  instagram: string | null;
  facebook: string | null;
  linkedin: string | null;
  website: string | null;
  passwordChangedAt: string | null;
  createdAt: string;
};

// A change is one field or a handful, never a whole record: the popup that edits
// the business sends the business and nothing else, so the rest cannot be
// overwritten by a form that never showed it.
export type ProfileChanges = Record<string, string>;

export function readProfile() {
  return requestApi<MemberProfile>('/api/members/me');
}

export function saveProfile(changes: ProfileChanges) {
  return requestApi<MemberProfile>('/api/members/me', { method: 'PATCH', body: changes });
}

// The account keeps the address it has until the address being claimed answers,
// which is what this asks the API to arrange.
export function requestEmailChange(email: string) {
  return requestApi<{ email: string; minutesValid: number }>('/api/members/me/email-change', {
    method: 'POST',
    body: { email },
  });
}

// The same endpoint the forgotten-password screen calls. The members module asks
// for the link from the profile rather than reaching into another module, and
// the answer is deliberately the same whether or not the address is an account.
export function requestPasswordLink(email: string) {
  return requestApi<{ minutesValid: number }>('/api/auth/password/forgot', {
    method: 'POST',
    body: { email },
  });
}

export function confirmEmailChange(token: string) {
  return requestApi<{ email: string }>(`/api/email-change/${encodeURIComponent(token)}`, {
    method: 'POST',
  });
}

export function readEmailChange(token: string) {
  return requestApi<{ email: string }>(`/api/email-change/${encodeURIComponent(token)}`);
}
