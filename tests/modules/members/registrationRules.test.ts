import { describe, it, expect } from 'vitest';
import {
  MINIMUM_PASSWORD_LENGTH,
  hasErrors,
  validateRegistration,
  type RegistrationDraft,
} from '@/modules/members/registrationRules';
import { IDENTIFICATION_TYPES, MEMBER_TYPES } from '@/modules/members/api/registration';

function completeDraft(overrides: RegistrationDraft = {}): RegistrationDraft {
  return {
    email: 'comercio@cclu.cr',
    phone: '22000000',
    canton: '65f0c3a1b2c3d4e5f6a7b8c9',
    location: 'Frente al parque',
    sector: '65f0c3a1b2c3d4e5f6a7b8ca',
    memberType: MEMBER_TYPES.BUSINESS,
    identificationType: IDENTIFICATION_TYPES.LEGAL_ENTITY_ID,
    identificationNumber: '3101000000',
    businessName: 'Panadería La Unión',
    businessDescription: 'Panadería artesanal',
    password: 'una-contrasena-larga',
    passwordConfirmation: 'una-contrasena-larga',
    ...overrides,
  };
}

describe('validateRegistration', () => {
  it('finds nothing wrong with a complete draft', () => {
    expect(hasErrors(validateRegistration(completeDraft()))).toBe(false);
  });

  it('names every obligatory field that is missing', () => {
    const errors = validateRegistration({});

    for (const field of [
      'email',
      'phone',
      'canton',
      'location',
      'sector',
      'identificationNumber',
      'businessName',
      'businessDescription',
      'password',
    ]) {
      expect(errors[field as keyof typeof errors]).toBeDefined();
    }
  });

  it('treats a field of only spaces as missing', () => {
    expect(validateRegistration(completeDraft({ businessName: '   ' })).businessName).toBeDefined();
  });

  it('refuses an address that is not one', () => {
    expect(validateRegistration(completeDraft({ email: 'sin-arroba' })).email).toBeDefined();
    expect(validateRegistration(completeDraft({ email: 'a@b' })).email).toBeDefined();
  });

  it('asks for a password long enough to be worth hashing', () => {
    const short = 'a'.repeat(MINIMUM_PASSWORD_LENGTH - 1);
    const errors = validateRegistration(
      completeDraft({ password: short, passwordConfirmation: short }),
    );

    expect(errors.password).toBeDefined();
  });

  it('catches a confirmation that does not match', () => {
    const errors = validateRegistration(completeDraft({ passwordConfirmation: 'otra-cosa-larga' }));

    expect(errors.passwordConfirmation).toBeDefined();
    expect(errors.password).toBeUndefined();
  });

  it('does not complain about a confirmation before there is a password', () => {
    const errors = validateRegistration(completeDraft({ password: '', passwordConfirmation: '' }));

    expect(errors.password).toBeDefined();
    expect(errors.passwordConfirmation).toBeUndefined();
  });

  it('leaves the optional fields alone', () => {
    const errors = validateRegistration(completeDraft({ instagram: '', website: '' }));

    expect(errors.instagram).toBeUndefined();
    expect(errors.website).toBeUndefined();
  });
});
