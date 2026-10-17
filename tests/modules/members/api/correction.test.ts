import { describe, it, expect } from 'vitest';
import {
  CORRECTION_FIELDS,
  correctionBodyFor,
  draftFrom,
  type OpenedCorrection,
} from '@/modules/members/api/correction';
import { EMPTY_DRAFT } from '@/modules/members/api/registration';

// What the link opens, with a value on every field the screen shows.
function opened(overrides: Partial<OpenedCorrection> = {}): OpenedCorrection {
  return {
    memberType: 'business',
    identificationType: 'legal_entity_id',
    identificationNumber: '3-102-650901',
    legalName: 'Granja Orgánica San Ramón Limitada',
    name: null,
    businessName: 'Granja Orgánica San Ramón',
    managerName: 'José Pablo Ureña Mata',
    activity: null,
    activityOther: 'Cultivo de hortalizas',
    canton: '65f0c3a1b2c3d4e5f6a7b8c9',
    district: 'San Ramón',
    phone: '8710 3345',
    whatsappNumber: '8710 3345',
    email: 'info@granjaorganicasanramon.cr',
    reason: 'La cédula jurídica no coincide con el nombre comercial.',
    fields: [
      {
        field: 'identificationNumber',
        message: 'no coincide con la razón social registrada.',
      },
    ],
    applicationStatus: 'changes_requested',
    reviewedAt: '2026-09-29T15:00:00.000Z',
    reviewedBy: 'Laura Jiménez Castro',
    ...overrides,
  };
}

describe('draftFrom', () => {
  // The rest of the registration travels along and is left alone, which is what
  // "los demás datos se conservan" means.
  it('opens the screen with what the API stored', () => {
    const draft = draftFrom(opened());

    expect(draft.businessName).toBe('Granja Orgánica San Ramón');
    expect(draft.legalName).toBe('Granja Orgánica San Ramón Limitada');
    expect(draft.identificationNumber).toBe('3-102-650901');
    expect(draft.email).toBe('info@granjaorganicasanramon.cr');
  });

  it('reads what the API left empty as an empty field rather than as null', () => {
    const draft = draftFrom(opened());

    expect(draft.name).toBe('');
    expect(draft.activity).toBe('');
  });

  // The link cannot reach these, so they keep the values the draft starts with
  // and stay out of the body below.
  it('leaves out of reach what the screen does not show', () => {
    const draft = draftFrom(opened());

    expect(draft.password).toBe(EMPTY_DRAFT.password);
    expect(draft.consents).toEqual(EMPTY_DRAFT.consents);
    expect(draft.businessDescription).toBe('');
    expect(draft.branchName).toBe('');
    expect(draft.billingEmail).toBe('');
  });
});

describe('correctionBodyFor', () => {
  it('sends the fields the screen shows and nothing else', () => {
    const body = correctionBodyFor(draftFrom(opened()));

    expect(Object.keys(body).sort()).toEqual(
      [
        'businessName',
        'canton',
        'district',
        'identificationNumber',
        'identificationType',
        'legalName',
        'managerName',
        'memberType',
        'activityOther',
        'phone',
        'whatsappNumber',
      ].sort(),
    );
  });

  it('never sends a password, an address or a member code', () => {
    const body = correctionBodyFor({ ...draftFrom(opened()), password: 'Contrasena1!' });

    expect('password' in body).toBe(false);
    expect('email' in body).toBe(false);
    expect('memberCode' in body).toBe(false);
    expect('consents' in body).toBe(false);
  });

  // A person is named by their own name and a company by its razón social, so
  // only the one that goes with what the applicant is travels.
  it('sends the name that goes with what the applicant is', () => {
    const person = draftFrom(
      opened({
        memberType: 'independent_professional',
        identificationType: 'national_id',
        legalName: null,
        name: 'José Pablo Ureña Mata',
      }),
    );

    const body = correctionBodyFor(person);

    expect(body.name).toBe('José Pablo Ureña Mata');
    expect('legalName' in body).toBe(false);
  });

  it('sends an activity chosen from the catalog as the reference it is', () => {
    const activity = '65f0c3a1b2c3d4e5f6a7b8ca';
    const body = correctionBodyFor({ ...draftFrom(opened({ activity })), activityOther: '' });

    expect(body.activity).toBe(activity);
    expect('activityOther' in body).toBe(false);
  });

  it('names every field the API accepts as correctable', () => {
    expect(CORRECTION_FIELDS).toContain('identificationNumber');
    expect(CORRECTION_FIELDS).not.toContain('email');
    expect(CORRECTION_FIELDS).not.toContain('password');
    expect(CORRECTION_FIELDS).not.toContain('billingEmail');
  });
});
