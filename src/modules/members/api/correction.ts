import { requestApi } from '@/shared/api/apiClient';
import { EMPTY_DRAFT, OTHER_ACTIVITY, type RegistrationDraft } from './registration';

// The fields the correction screen shows, which is what the chamber may ask to
// have corrected. The API keeps the same list, in cclu-api at
// src/services/resubmissionService.js, and refuses anything outside it, so the
// two agree on purpose: a field the form could not show would be erased rather
// than corrected. The order is the one the form asks them in.
export const CORRECTION_FIELDS = [
  'memberType',
  'identificationType',
  'identificationNumber',
  'legalName',
  'name',
  'businessName',
  'managerName',
  'activity',
  'activityOther',
  'canton',
  'district',
  'phone',
  'whatsappNumber',
] as const;

export type CorrectionField = (typeof CORRECTION_FIELDS)[number];

// What the chamber pointed at, and what it said about it.
export type Correction = {
  field: CorrectionField;
  message: string;
};

export type OpenedCorrection = Record<CorrectionField, string | null> & {
  email: string;
  reason: string | null;
  fields: Correction[];
  applicationStatus: 'rejected' | 'changes_requested';
  reviewedAt: string | null;
  reviewedBy: string | null;
};

// The same draft the registration works on, so the same rules check it. The
// parts this link cannot reach keep the empty values they start with, which is
// what keeps them out of the body below.
export function draftFrom(opened: OpenedCorrection): RegistrationDraft {
  const text = (value: string | null | undefined) => value ?? '';

  return {
    ...EMPTY_DRAFT,
    email: text(opened.email),
    memberType: text(opened.memberType) as RegistrationDraft['memberType'],
    identificationType: text(opened.identificationType),
    identificationNumber: text(opened.identificationNumber),
    legalName: text(opened.legalName),
    name: text(opened.name),
    businessName: text(opened.businessName),
    managerName: text(opened.managerName),
    activity: text(opened.activity),
    activityOther: text(opened.activityOther),
    canton: text(opened.canton),
    district: text(opened.district),
    phone: text(opened.phone),
    whatsappNumber: text(opened.whatsappNumber),
  };
}

// Only the fields the screen shows travel. Nothing else is read at the other end,
// and a body carrying a password nobody asked for is a habit worth not having.
export function correctionBodyFor(draft: RegistrationDraft) {
  const body: Record<string, string> = {
    memberType: draft.memberType,
    identificationType: draft.identificationType,
    identificationNumber: draft.identificationNumber.trim(),
    businessName: draft.businessName.trim(),
    managerName: draft.managerName.trim(),
    canton: draft.canton,
    district: draft.district.trim(),
    phone: draft.phone.trim(),
    whatsappNumber: draft.whatsappNumber.trim(),
  };

  // A blank optional field is sent as absent rather than as an empty string,
  // because that is what the API reads as "this one is gone".
  const activityOther = draft.activityOther.trim();

  if (activityOther !== '') {
    body.activityOther = activityOther;
  }

  // The one that names the applicant, which is the one their type calls for.
  const identity = draft.memberType === 'independent_professional' ? 'name' : 'legalName';

  body[identity] = draft[identity].trim();

  if (draft.activity !== '' && draft.activity !== OTHER_ACTIVITY) {
    body.activity = draft.activity;
  }

  return body;
}

export function readCorrection(token: string) {
  return requestApi<OpenedCorrection>(`/api/resubmission/${encodeURIComponent(token)}`);
}

export function submitCorrection(token: string, draft: RegistrationDraft) {
  return requestApi<{ id: string; applicationStatus: string }>(
    `/api/resubmission/${encodeURIComponent(token)}`,
    { method: 'POST', body: correctionBodyFor(draft) },
  );
}
