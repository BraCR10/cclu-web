import { MEMBER_TYPES, type MemberType, type Registration } from './api/registration';
import { PASSWORD, checkField, checkPassword } from '@/shared/config/memberRules';
import { messageForCode, messageForFieldCode } from '@/shared/config/messages';

export const MINIMUM_PASSWORD_LENGTH = PASSWORD.minimumLength;

// Spanish, because these reach a person. The server validates the same things
// again, and that is the check that counts.
export const LABELS: Record<MemberType, { identification: string; name: string }> = {
  [MEMBER_TYPES.BUSINESS]: {
    identification: 'Cédula jurídica o física del comercio',
    name: 'Nombre comercial',
  },
  [MEMBER_TYPES.INDEPENDENT_PROFESSIONAL]: {
    identification: 'Número de identificación',
    name: 'Nombre con el que trabaja',
  },
};

export type RegistrationDraft = Partial<Record<keyof Registration, string>> & {
  passwordConfirmation?: string;
};

const REQUIRED_FIELDS: (keyof Registration)[] = [
  'email',
  'phone',
  'canton',
  'location',
  'sector',
  'memberType',
  'identificationType',
  'identificationNumber',
  'businessName',
  'businessDescription',
  'password',
];

const OPTIONAL_FIELDS: (keyof Registration)[] = [
  'whatsappNumber',
  'instagram',
  'facebook',
  'linkedin',
  'website',
];

// The order the fields appear in on the screen, which is the order somebody
// filling the form would meet a mistake in.
export const FIELD_ORDER: readonly string[] = [
  ...REQUIRED_FIELDS,
  'passwordConfirmation',
  ...OPTIONAL_FIELDS,
];

const CONFIRMATION_MESSAGE = 'Las contraseñas no coinciden.';

export type RegistrationErrors = Partial<Record<keyof RegistrationDraft, string>>;

// The confirmation never leaves this file. It answers a typing mistake, not a
// question the server has any use for.
export function validateRegistration(draft: RegistrationDraft): RegistrationErrors {
  const errors: RegistrationErrors = {};

  // The same codes the API would answer with, so the sentence a person reads
  // does not change depending on which side caught the mistake.
  for (const field of REQUIRED_FIELDS) {
    const code = checkField(field, draft[field] ?? '', { required: true });

    if (code !== null) {
      errors[field] = messageForFieldCode(field, code);
    }
  }

  for (const field of OPTIONAL_FIELDS) {
    const code = checkField(field, draft[field] ?? '', { required: false });

    if (code !== null) {
      errors[field] = messageForFieldCode(field, code);
    }
  }

  const password = draft.password ?? '';

  if (password !== '') {
    const code = checkPassword(password);

    if (code !== null) {
      errors.password = messageForCode(code);
    }

    if (draft.passwordConfirmation !== password) {
      errors.passwordConfirmation = CONFIRMATION_MESSAGE;
    }
  }

  return errors;
}

export function hasErrors(errors: RegistrationErrors): boolean {
  return Object.keys(errors).length > 0;
}

// Built field by field rather than by dropping the confirmation, so the request
// carries what the API accepts and nothing the form happened to be holding.
export function toRegistration(draft: RegistrationDraft): Registration {
  const registration = {} as Record<string, string>;

  for (const field of REQUIRED_FIELDS) {
    registration[field] = (draft[field] ?? '').trim();
  }

  for (const field of OPTIONAL_FIELDS) {
    const value = (draft[field] ?? '').trim();

    if (value !== '') {
      registration[field] = value;
    }
  }

  return registration as unknown as Registration;
}
