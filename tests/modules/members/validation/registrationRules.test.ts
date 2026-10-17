import { describe, it, expect } from 'vitest';
import { EMPTY_DRAFT, type RegistrationDraft } from '@/modules/members/api/registration';
import {
  problemsInStepOne,
  problemsInStepThree,
  problemsInStepTwo,
} from '@/modules/members/validation/registrationRules';

function draft(overrides: Partial<RegistrationDraft> = {}): RegistrationDraft {
  return {
    ...EMPTY_DRAFT,
    memberType: 'business',
    identificationType: 'legal_entity_id',
    identificationNumber: '3-101-784512',
    legalName: 'Café Loma Verde Sociedad Anónima',
    legalRepresentativeName: 'Mariana Solís Quesada',
    legalRepresentativeIdentification: '1-1234-0567',
    certificationFileKey:
      'membership-certifications/65f0c3a1b2c3d4e5f6a7b8c9/0123456789abcdef0123456789abcdef.pdf',
    certificationIssuedAt: '2026-09-15',
    businessName: 'Café Loma Verde',
    managerName: 'Mariana Solís Quesada',
    activity: '65f0c3a1b2c3d4e5f6a7b8ca',
    businessDescription: 'Cafetería de especialidad.',
    branchModality: 'physical',
    branchName: 'Sucursal San Juan',
    canton: '65f0c3a1b2c3d4e5f6a7b8c9',
    district: 'San Juan',
    location: 'Frente al parque',
    institutionalPhone: '22223333',
    email: 'mariana@cafelomaverde.cr',
    phone: '88451290',
    whatsappNumber: '88451290',
    billingEmail: 'facturacion@cafelomaverde.cr',
    password: 'Contrasena1!',
    passwordConfirmation: 'Contrasena1!',
    consents: { statutes: true, marketplaceTerms: true, privacyPolicy: true },
    ...overrides,
  };
}

describe('the registration rules', () => {
  it('accept the form the prototype draws', () => {
    expect(problemsInStepOne(draft())).toEqual([]);
    expect(problemsInStepTwo(draft())).toEqual([]);
    expect(problemsInStepThree(draft())).toEqual([]);
  });

  // What proves an applicant differs by what they are, and so does what names
  // them: a company gives its razón social and who answers for it, a person
  // gives their own name.
  it('ask an empresa for its cédula jurídica and a person for their own document', () => {
    expect(problemsInStepOne(draft({ identificationType: 'national_id' }))).toEqual([
      { field: 'identificationType', code: 'not_allowed' },
    ]);

    const independent = draft({
      memberType: 'independent_professional',
      identificationType: 'national_id',
      name: 'Mariana Solís Quesada',
    });

    expect(problemsInStepOne(independent)).toEqual([]);
    expect(problemsInStepOne({ ...independent, name: '' })).toEqual([
      { field: 'name', code: 'required' },
    ]);
  });

  it('ask only a company or an association for the personería jurídica', () => {
    expect(
      problemsInStepOne(draft({ certificationFileKey: '', certificationIssuedAt: '' })),
    ).toEqual([
      { field: 'certificationFileKey', code: 'required' },
      { field: 'certificationIssuedAt', code: 'required' },
    ]);

    const independent = draft({
      memberType: 'independent_professional',
      identificationType: 'dimex',
      name: 'Mariana Solís Quesada',
      certificationFileKey: '',
      certificationIssuedAt: '',
    });

    expect(problemsInStepOne(independent)).toEqual([]);
  });

  it('take the activity from the catalog or written out, and never from neither', () => {
    expect(problemsInStepTwo(draft({ activity: '', activityOther: '' }))).toEqual([
      { field: 'activityOther', code: 'required' },
    ]);
    expect(
      problemsInStepTwo(draft({ activity: 'other', activityOther: 'Tostaduría de café' })),
    ).toEqual([]);
  });

  it('ask a branch with a door for its address and let a virtual one go without', () => {
    expect(problemsInStepTwo(draft({ location: '' }))).toEqual([
      { field: 'location', code: 'required' },
    ]);
    expect(problemsInStepTwo(draft({ branchModality: 'virtual', location: '' }))).toEqual([]);
  });

  it('name the field a value is wrong in, and say which wrong it is', () => {
    expect(problemsInStepTwo(draft({ businessDescription: 'x'.repeat(501) }))).toEqual([
      { field: 'businessDescription', code: 'too_long' },
    ]);
    expect(problemsInStepThree(draft({ email: 'mariana(at)cafelomaverde.cr' }))).toEqual([
      { field: 'email', code: 'email' },
    ]);
    expect(problemsInStepThree(draft({ phone: '123' }))).toEqual([
      { field: 'phone', code: 'invalid_format' },
    ]);
  });

  it('want the confirmation to match, the password to pass, and the three consents given', () => {
    expect(problemsInStepThree(draft({ passwordConfirmation: 'Otra1!' }))).toEqual([
      { field: 'passwordConfirmation', code: 'mismatch' },
    ]);

    expect(
      problemsInStepThree(draft({ password: 'corta', passwordConfirmation: 'corta' })),
    ).toEqual([{ field: 'password', code: 'password' }]);

    expect(
      problemsInStepThree(
        draft({ consents: { statutes: false, marketplaceTerms: false, privacyPolicy: false } }),
      ),
    ).toEqual([
      { field: 'consentStatutes', code: 'consents' },
      { field: 'consentMarketplace', code: 'consents' },
      { field: 'consentPrivacy', code: 'consents' },
    ]);
  });
});
