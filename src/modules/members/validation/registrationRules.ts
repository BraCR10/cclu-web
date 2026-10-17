import type { RegistrationDraft } from '../api/registration';
import { OTHER_ACTIVITY } from '../api/registration';
import {
  DOCUMENT,
  EMAIL,
  HANDLE,
  LINK,
  PHONE,
  check,
  isCompany,
  type FieldName,
  type Problem,
  type ProblemCode,
} from './fieldRules';
import {
  PASSWORD_MAXIMUM_BYTES,
  isPasswordAcceptable,
  passwordByteLength,
} from '@/shared/validation/password';

// The rules a field answers to live beside the fields, in fieldRules.ts, because
// a correction writes the same fields and has to answer to the same rules.
export type { FieldName, Problem, ProblemCode };

// What proves each kind of applicant: an empresa and an asociación by their
// cédula jurídica, a person by their own document.
export const IDENTIFICATION_TYPES_BY_MEMBER_TYPE: Record<
  Exclude<RegistrationDraft['memberType'], ''>,
  string[]
> = {
  business: ['legal_entity_id'],
  association: ['legal_entity_id'],
  independent_professional: ['national_id', 'dimex', 'passport'],
};

export function problemsInStepOne(draft: RegistrationDraft): Problem[] {
  const problems: Problem[] = [];
  const company = isCompany(draft.memberType);

  if (draft.memberType === '') {
    problems.push({ field: 'memberType', code: 'required' });
  }

  if (draft.identificationType === '') {
    problems.push({ field: 'identificationType', code: 'required' });
  } else if (
    draft.memberType !== '' &&
    !IDENTIFICATION_TYPES_BY_MEMBER_TYPE[draft.memberType].includes(draft.identificationType)
  ) {
    problems.push({ field: 'identificationType', code: 'not_allowed' });
  }

  check(problems, 'identificationNumber', draft.identificationNumber, {
    required: true,
    maxLength: 20,
    pattern: DOCUMENT,
  });

  // An empresa and an asociación give their razón social and the person who
  // answers for them, with the personería jurídica that proves both. A
  // profesional independiente gives their own name and nothing else.
  if (company) {
    check(problems, 'legalName', draft.legalName, { required: true, maxLength: 120 });
    check(problems, 'legalRepresentativeName', draft.legalRepresentativeName, {
      required: true,
      maxLength: 120,
    });
    check(problems, 'legalRepresentativeIdentification', draft.legalRepresentativeIdentification, {
      required: true,
      maxLength: 20,
      pattern: DOCUMENT,
    });

    if (draft.certificationFileKey === '') {
      problems.push({ field: 'certificationFileKey', code: 'required' });
    }

    check(problems, 'certificationIssuedAt', draft.certificationIssuedAt, { required: true });
  }

  if (draft.memberType === 'independent_professional') {
    check(problems, 'name', draft.name, { required: true, maxLength: 120 });
  }

  return problems;
}

export function problemsInStepTwo(draft: RegistrationDraft): Problem[] {
  const problems: Problem[] = [];

  check(problems, 'businessName', draft.businessName, { required: true, maxLength: 120 });
  check(problems, 'managerName', draft.managerName, { required: true, maxLength: 120 });
  check(problems, 'businessDescription', draft.businessDescription, {
    required: true,
    maxLength: 500,
  });

  // The catalog's activity or one written out, never neither.
  if (draft.activity === '' || draft.activity === OTHER_ACTIVITY) {
    check(problems, 'activityOther', draft.activityOther, { required: true, maxLength: 120 });
  }

  if (draft.branchModality === '') {
    problems.push({ field: 'branchModality', code: 'required' });
  }

  check(problems, 'branchName', draft.branchName, { required: true, maxLength: 120 });

  if (draft.canton === '') {
    problems.push({ field: 'canton', code: 'required' });
  }

  check(problems, 'district', draft.district, { required: true, maxLength: 120 });
  check(problems, 'location', draft.location, {
    required: draft.branchModality === 'physical',
    maxLength: 200,
  });
  check(problems, 'institutionalPhone', draft.institutionalPhone, {
    required: true,
    maxLength: 20,
    pattern: PHONE,
  });

  return problems;
}

export function problemsInStepThree(draft: RegistrationDraft): Problem[] {
  const problems: Problem[] = [];

  check(problems, 'email', draft.email, {
    required: true,
    maxLength: 254,
    pattern: EMAIL,
    code: 'email',
  });
  check(problems, 'phone', draft.phone, { required: true, maxLength: 20, pattern: PHONE });
  check(problems, 'whatsappNumber', draft.whatsappNumber, {
    required: true,
    maxLength: 20,
    pattern: PHONE,
  });
  check(problems, 'billingEmail', draft.billingEmail, {
    required: true,
    maxLength: 254,
    pattern: EMAIL,
    code: 'email',
  });

  check(problems, 'website', draft.website, { maxLength: 300, pattern: LINK });
  check(problems, 'instagram', draft.instagram, { maxLength: 60, pattern: HANDLE });
  check(problems, 'facebook', draft.facebook, { maxLength: 60, pattern: HANDLE });

  if (
    !isPasswordAcceptable(draft.password) ||
    passwordByteLength(draft.password) > PASSWORD_MAXIMUM_BYTES
  ) {
    problems.push({ field: 'password', code: 'password' });
  }

  if (draft.passwordConfirmation !== draft.password) {
    problems.push({ field: 'passwordConfirmation', code: 'mismatch' });
  }

  for (const [field, given] of [
    ['consentStatutes', draft.consents.statutes],
    ['consentMarketplace', draft.consents.marketplaceTerms],
    ['consentPrivacy', draft.consents.privacyPolicy],
  ] as const) {
    if (!given) {
      problems.push({ field, code: 'consents' });
    }
  }

  return problems;
}

export function problemsInStep(step: number, draft: RegistrationDraft): Problem[] {
  if (step === 1) {
    return problemsInStepOne(draft);
  }

  return step === 2 ? problemsInStepTwo(draft) : problemsInStepThree(draft);
}
