import { MEMBER_TYPES, type MemberType, type Registration } from './api/registration';

export const MINIMUM_PASSWORD_LENGTH = 12;

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

const MESSAGES = {
  required: 'Este dato es obligatorio.',
  email: 'Escriba un correo electrónico válido.',
  password: `La contraseña debe tener al menos ${MINIMUM_PASSWORD_LENGTH} caracteres.`,
  confirmation: 'Las contraseñas no coinciden.',
};

export type RegistrationErrors = Partial<Record<keyof RegistrationDraft, string>>;

// The confirmation never leaves this file. It answers a typing mistake, not a
// question the server has any use for.
export function validateRegistration(draft: RegistrationDraft): RegistrationErrors {
  const errors: RegistrationErrors = {};

  for (const field of REQUIRED_FIELDS) {
    if ((draft[field] ?? '').trim() === '') {
      errors[field] = MESSAGES.required;
    }
  }

  const email = (draft.email ?? '').trim();

  if (email !== '' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errors.email = MESSAGES.email;
  }

  const password = draft.password ?? '';

  if (password !== '' && password.length < MINIMUM_PASSWORD_LENGTH) {
    errors.password = MESSAGES.password;
  }

  if (password !== '' && draft.passwordConfirmation !== password) {
    errors.passwordConfirmation = MESSAGES.confirmation;
  }

  return errors;
}

export function hasErrors(errors: RegistrationErrors): boolean {
  return Object.keys(errors).length > 0;
}

const OPTIONAL_FIELDS: (keyof Registration)[] = [
  'whatsappNumber',
  'instagram',
  'facebook',
  'linkedin',
  'website',
];

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
