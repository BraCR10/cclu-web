import { describe, it, expect } from 'vitest';
import { ApiError } from '@/shared/api/request';
import {
  EXPLAINED_PATTERNS,
  MESSAGES,
  describeField,
  messageForError,
  messageForFieldCode,
} from '@/shared/config/messages';
import { FIELDS } from '@/shared/config/memberRules';
import { SIGN_IN_STATUS } from '@/shared/components/CredentialsForm';
import { REFUSAL_REASONS } from '@/modules/members/api/memberSession';

const signInOptions = { byStatus: SIGN_IN_STATUS, fallback: MESSAGES.sign_in_unavailable };

function atSignIn(error: unknown): string {
  return messageForError(error, signInOptions);
}

describe('messageForError at a sign in screen', () => {
  it('says the same thing for a wrong password as for an address that is not an account', () => {
    expect(atSignIn(new ApiError(401, 'Unauthorized'))).toBe(MESSAGES.invalid_credentials);
  });

  it('never hints at an account when the password was wrong', () => {
    const shown = atSignIn(new ApiError(401, 'Unauthorized'));

    expect(shown).not.toContain('solicitud');
    expect(shown).not.toContain('revisión');
    expect(shown).not.toContain('rechazada');
  });

  it('explains a pending application, which the API only names once the password was right', () => {
    const shown = atSignIn(
      new ApiError(403, 'Forbidden', { reason: REFUSAL_REASONS.APPLICATION_PENDING }),
    );

    expect(shown).toBe(MESSAGES.application_pending);
  });

  it('explains a rejected application and points at the message that carries the reason', () => {
    expect(
      atSignIn(new ApiError(403, 'Forbidden', { reason: REFUSAL_REASONS.APPLICATION_REJECTED })),
    ).toBe(MESSAGES.application_rejected);
  });

  it('explains a suspended account', () => {
    expect(
      atSignIn(new ApiError(403, 'Forbidden', { reason: REFUSAL_REASONS.ACCOUNT_SUSPENDED })),
    ).toBe(MESSAGES.account_suspended);
  });

  it('separates a rate limit from credentials that were wrong', () => {
    expect(atSignIn(new ApiError(429, 'Too Many Requests'))).toBe(MESSAGES.too_many_attempts);
  });

  // A 403 means "your session lacks permission" everywhere else. At a sign in
  // screen nobody has a session yet, so saying it would be false.
  it('falls back rather than inventing a message for a reason it does not know', () => {
    expect(atSignIn(new ApiError(403, 'Forbidden', { reason: 'algo_nuevo' }))).toBe(
      MESSAGES.sign_in_unavailable,
    );
    expect(atSignIn(new ApiError(403, 'Forbidden'))).toBe(MESSAGES.sign_in_unavailable);
  });

  it('treats anything that is not an API answer as the server being unavailable', () => {
    expect(atSignIn(new Error('network down'))).toBe(MESSAGES.sign_in_unavailable);
    expect(atSignIn(undefined)).toBe(MESSAGES.sign_in_unavailable);
  });
});

describe('messageForError elsewhere', () => {
  it('prefers the code the API named over what the status would mean', () => {
    const error = new ApiError(400, 'Bad Request', { code: 'password_too_short' });

    expect(messageForError(error)).toBe(MESSAGES.password_too_short);
  });

  it('does explain a lack of permission when the screen did not override it', () => {
    expect(messageForError(new ApiError(403, 'Forbidden'))).toBe(MESSAGES.not_allowed_role);
  });
});

describe('describeField', () => {
  // A pattern nobody wrote a sentence for is a field that refuses without ever
  // saying what it wanted.
  it('explains every pattern the rules can reject a field with', () => {
    for (const pattern of EXPLAINED_PATTERNS) {
      const field = Object.keys(FIELDS).find((name) => FIELDS[name].pattern === pattern);

      expect(field, `no field uses the ${pattern} pattern`).toBeDefined();
      expect(describeField(field as string).length).toBeGreaterThan(0);
    }
  });

  it('states the character limit when the rule itself does not', () => {
    expect(describeField('businessName')).toEqual(['Máximo 120 caracteres.']);
  });

  // The phone rule already says "between 8 and 20", so repeating "maximum 20"
  // below it reads like a second, different rule.
  it('does not repeat the length when the rule already gave it', () => {
    expect(describeField('phone')).toHaveLength(1);
    expect(describeField('phone')[0]).toContain('8 y 20');
  });

  it('says nothing about a field the rules do not govern', () => {
    expect(describeField('memberType')).toEqual([]);
  });
});

describe('messageForFieldCode', () => {
  it('answers a bad format with the rule that was broken, not with "check the format"', () => {
    const shown = messageForFieldCode('website', 'invalid_format');

    expect(shown).toContain('https://');
    expect(shown).not.toBe(MESSAGES.invalid_format);
  });

  it('falls back to the general sentence where there is no rule to state', () => {
    expect(messageForFieldCode('memberType', 'invalid_format')).toBe(MESSAGES.invalid_format);
  });

  it('leaves every other code alone', () => {
    expect(messageForFieldCode('website', 'required')).toBe(MESSAGES.required);
  });
});
