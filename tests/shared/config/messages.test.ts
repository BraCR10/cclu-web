import { describe, it, expect } from 'vitest';
import { ApiError } from '@/shared/api/request';
import { MESSAGES, messageForError } from '@/shared/config/messages';
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
