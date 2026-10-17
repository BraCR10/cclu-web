import type { RegistrationDraft } from '../api/registration';
import { OTHER_ACTIVITY } from '../api/registration';
import { DOCUMENT, PHONE, check, isCompany, type FieldName, type Problem } from './fieldRules';
import { IDENTIFICATION_TYPES_BY_MEMBER_TYPE } from './registrationRules';

// What each field the correction screen shows answers to, which is the rule the
// registration already applies to the same field. A correction sends the whole
// screen, so a field left empty on it is a field somebody cleared.
const RULES: Partial<Record<FieldName, Parameters<typeof check>[3]>> = {
  identificationNumber: { required: true, maxLength: 20, pattern: DOCUMENT },
  legalName: { required: true, maxLength: 120 },
  name: { required: true, maxLength: 120 },
  businessName: { required: true, maxLength: 120 },
  managerName: { required: true, maxLength: 120 },
  activityOther: { required: true, maxLength: 120 },
  district: { required: true, maxLength: 120 },
  phone: { required: true, maxLength: 20, pattern: PHONE },
  whatsappNumber: { required: true, maxLength: 20, pattern: PHONE },
};

// What a correction answers to: the same rules as the registration for the fields
// the screen shows, and nothing at all for the fields it does not. The address,
// the password and the consents are changed by their own flows, so nothing here
// has an opinion about them.
export function problemsInCorrection(draft: RegistrationDraft): Problem[] {
  const problems: Problem[] = [];

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

  for (const field of [
    'identificationNumber',
    'businessName',
    'managerName',
    'district',
    'phone',
    'whatsappNumber',
  ] as const) {
    check(problems, field, draft[field], RULES[field] ?? {});
  }

  // Only the name that goes with what the applicant is: the form asks for one of
  // the two, and the API clears the other.
  const identity = isCompany(draft.memberType) ? ('legalName' as const) : ('name' as const);

  check(problems, identity, draft[identity], RULES[identity] ?? {});

  if (draft.canton === '') {
    problems.push({ field: 'canton', code: 'required' });
  }

  // The catalog's activity or one written out, never neither.
  if (draft.activity === '' || draft.activity === OTHER_ACTIVITY) {
    check(problems, 'activityOther', draft.activityOther, RULES.activityOther ?? {});
  }

  return problems;
}
