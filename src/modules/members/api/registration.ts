import { requestApi } from '@/shared/api/apiClient';

export type CatalogCanton = {
  _id: string;
  name: string;
  province: string;
};

export type CatalogActivity = {
  _id: string;
  name: string;
};

export type UploadPurpose = 'membership-certifications' | 'member-logos';

// The value the activity list answers with when the applicant's trade is not in
// it yet. It never travels as a reference: the name they write does.
export const OTHER_ACTIVITY = 'other';

export type RegistrationDraft = {
  memberType: '' | 'business' | 'association' | 'independent_professional';
  identificationType: string;
  identificationNumber: string;
  name: string;
  legalName: string;
  legalRepresentativeName: string;
  legalRepresentativeIdentification: string;
  certificationFileKey: string;
  certificationIssuedAt: string;
  businessName: string;
  managerName: string;
  activity: string;
  activityOther: string;
  businessDescription: string;
  logoFileKey: string;
  branchModality: '' | 'physical' | 'virtual';
  branchName: string;
  canton: string;
  district: string;
  location: string;
  institutionalPhone: string;
  email: string;
  phone: string;
  whatsappNumber: string;
  billingEmail: string;
  instagram: string;
  facebook: string;
  website: string;
  password: string;
  passwordConfirmation: string;
  consents: {
    statutes: boolean;
    marketplaceTerms: boolean;
    privacyPolicy: boolean;
  };
};

export const EMPTY_DRAFT: RegistrationDraft = {
  memberType: '',
  identificationType: '',
  identificationNumber: '',
  name: '',
  legalName: '',
  legalRepresentativeName: '',
  legalRepresentativeIdentification: '',
  certificationFileKey: '',
  certificationIssuedAt: '',
  businessName: '',
  managerName: '',
  activity: '',
  activityOther: '',
  businessDescription: '',
  logoFileKey: '',
  branchModality: '',
  branchName: '',
  canton: '',
  district: '',
  location: '',
  institutionalPhone: '',
  email: '',
  phone: '',
  whatsappNumber: '',
  billingEmail: '',
  instagram: '',
  facebook: '',
  website: '',
  password: '',
  passwordConfirmation: '',
  consents: { statutes: false, marketplaceTerms: false, privacyPolicy: false },
};

export function readCantons() {
  return requestApi<CatalogCanton[]>('/api/cantons');
}

export function readActivities() {
  return requestApi<CatalogActivity[]>('/api/activities');
}

// The uploaded name is never the key the file is stored under, so a person is
// free to call their certification whatever they like.
export function uploadFile({
  file,
  purpose,
  ownerId,
}: {
  file: File;
  purpose: UploadPurpose;
  ownerId: string;
}) {
  const body = new FormData();

  body.append('purpose', purpose);
  body.append('ownerId', ownerId);
  body.append('file', file);

  return requestApi<{ key: string }>('/api/files', { method: 'POST', body });
}

// Only what the applicant filled in travels. An empty field is left out rather
// than sent as an empty string, because the API reads a blank as a refusal and
// an absent field as "not asked of this member type".
export function submissionFor(draft: RegistrationDraft) {
  const body: Record<string, unknown> = {
    memberType: draft.memberType,
    identificationType: draft.identificationType,
    identificationNumber: draft.identificationNumber.trim(),
    businessName: draft.businessName.trim(),
    managerName: draft.managerName.trim(),
    businessDescription: draft.businessDescription.trim(),
    branchModality: draft.branchModality,
    branchName: draft.branchName.trim(),
    canton: draft.canton,
    district: draft.district.trim(),
    institutionalPhone: draft.institutionalPhone.trim(),
    email: draft.email.trim(),
    phone: draft.phone.trim(),
    whatsappNumber: draft.whatsappNumber.trim(),
    billingEmail: draft.billingEmail.trim(),
    password: draft.password,
    consents: draft.consents,
  };

  const optional: Array<[string, string]> = [
    ['name', draft.name],
    ['legalName', draft.legalName],
    ['legalRepresentativeName', draft.legalRepresentativeName],
    ['legalRepresentativeIdentification', draft.legalRepresentativeIdentification],
    ['certificationFileKey', draft.certificationFileKey],
    ['certificationIssuedAt', draft.certificationIssuedAt],
    ['activityOther', draft.activityOther],
    ['logoFileKey', draft.logoFileKey],
    ['location', draft.location],
    ['instagram', draft.instagram],
    ['facebook', draft.facebook],
    ['website', draft.website],
  ];

  for (const [field, value] of optional) {
    const trimmed = value.trim();

    if (trimmed !== '') {
      body[field] = trimmed;
    }
  }

  if (draft.activity !== '' && draft.activity !== OTHER_ACTIVITY) {
    body.activity = draft.activity;
  }

  return body;
}

export function submitRegistration(draft: RegistrationDraft) {
  return requestApi<{ id: string }>('/api/members', {
    method: 'POST',
    body: submissionFor(draft),
  });
}
