import { describe, it, expect } from 'vitest';
import { EMPTY_DRAFT, type RegistrationDraft } from '@/modules/members/api/registration';
import { problemsInCorrection } from '@/modules/members/validation/correctionRules';

// Everything the correction screen carries, and nothing it does not: the
// address, the password, the description, the branch and the billing address are
// not part of it.
function draft(overrides: Partial<RegistrationDraft> = {}): RegistrationDraft {
  return {
    ...EMPTY_DRAFT,
    memberType: 'business',
    identificationType: 'legal_entity_id',
    identificationNumber: '3-102-650901',
    legalName: 'Granja Orgánica San Ramón Limitada',
    businessName: 'Granja Orgánica San Ramón',
    managerName: 'José Pablo Ureña Mata',
    activity: '65f0c3a1b2c3d4e5f6a7b8ca',
    canton: '65f0c3a1b2c3d4e5f6a7b8c9',
    district: 'San Ramón',
    phone: '8710 3345',
    whatsappNumber: '8710 3345',
    ...overrides,
  };
}

describe('the correction rules', () => {
  it('accept a correction that changed nothing but a district', () => {
    expect(problemsInCorrection(draft())).toEqual([]);
  });

  // The screen reaches six groups of fields and nothing else, so a draft with no
  // password, no consent and no branch is not a draft with something missing.
  it('ask for nothing the screen does not show', () => {
    const fields = problemsInCorrection(draft()).map((problem) => problem.field);

    expect(fields).not.toContain('password');
    expect(fields).not.toContain('consentStatutes');
    expect(fields).not.toContain('email');
    expect(fields).not.toContain('businessDescription');
    expect(fields).not.toContain('branchName');
    expect(fields).not.toContain('billingEmail');
  });

  it('ask for what the registration asks for', () => {
    const problems = problemsInCorrection(draft({ businessName: '', phone: '  ' }));

    expect(problems).toEqual([
      { field: 'businessName', code: 'required' },
      { field: 'phone', code: 'required' },
    ]);
  });

  // What the applicant is decides which name names them, so only that one is
  // asked for.
  it('ask a company for its razón social and a person for their own name', () => {
    expect(problemsInCorrection(draft({ legalName: '' }))).toEqual([
      { field: 'legalName', code: 'required' },
    ]);

    const person = draft({
      memberType: 'independent_professional',
      identificationType: 'national_id',
      legalName: '',
      name: '',
    });

    expect(problemsInCorrection(person)).toEqual([{ field: 'name', code: 'required' }]);
  });

  it('refuse an identification type that does not go with the member type', () => {
    expect(problemsInCorrection(draft({ identificationType: 'passport' }))).toEqual([
      { field: 'identificationType', code: 'not_allowed' },
    ]);
  });

  it('refuse with the same words the registration uses', () => {
    expect(problemsInCorrection(draft({ whatsappNumber: '123' }))).toEqual([
      { field: 'whatsappNumber', code: 'invalid_format' },
    ]);
  });

  it('ask for the activity either way it was answered', () => {
    expect(problemsInCorrection(draft({ activity: '', activityOther: '' }))).toEqual([
      { field: 'activityOther', code: 'required' },
    ]);
    expect(
      problemsInCorrection(draft({ activity: '', activityOther: 'Cultivo de hortalizas' })),
    ).toEqual([]);
  });

  it('ask for a cantón and a distrito, which are what the profile is filed by', () => {
    expect(problemsInCorrection(draft({ canton: '', district: '' }))).toEqual([
      { field: 'district', code: 'required' },
      { field: 'canton', code: 'required' },
    ]);
  });
});
