import { describe, it, expect } from 'vitest';
import { EMPTY_DRAFT, OTHER_ACTIVITY, submissionFor } from '@/modules/members/api/registration';

describe('submissionFor', () => {
  // An empty string is a refusal to the API and an absent field is "not asked of
  // this member type", so what was not filled in is left out.
  it('sends what was not filled in as an absent field rather than a blank', () => {
    const body = submissionFor({
      ...EMPTY_DRAFT,
      memberType: 'independent_professional',
      activity: OTHER_ACTIVITY,
      activityOther: 'Tostaduría de café',
    });

    expect('legalName' in body).toBe(false);
    expect('certificationFileKey' in body).toBe(false);
    expect('activity' in body).toBe(false);
    expect(body.activityOther).toBe('Tostaduría de café');
  });

  it('sends an activity chosen from the catalog as the reference it is', () => {
    const body = submissionFor({ ...EMPTY_DRAFT, activity: '65f0c3a1b2c3d4e5f6a7b8ca' });

    expect(body.activity).toBe('65f0c3a1b2c3d4e5f6a7b8ca');
    expect('activityOther' in body).toBe(false);
  });

  // A trailing space inside a password is part of it, and trimming it here would
  // set a password nobody could then type.
  it('trims what a person typed and leaves the password exactly as it was', () => {
    const body = submissionFor({
      ...EMPTY_DRAFT,
      businessName: '  Café Loma Verde  ',
      password: 'Contrasena1! ',
    });

    expect(body.businessName).toBe('Café Loma Verde');
    expect(body.password).toBe('Contrasena1! ');
  });
});
